import { test, expect, create } from './fixtures';
import type { APIRequestContext } from '@playwright/test';

export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
type Cleanup = Array<{ endpoint: string; id: number }>;
export async function bank(api: APIRequestContext, cleanup: Cleanup, unique: string) {
  return create(api, cleanup, '/conta-bancaria', { nome: `Banco ${unique}`, conta: unique, tipo: 'ContaCorrente' });
}
async function account(api: APIRequestContext, cleanup: Cleanup, unique: string, tipo = 'PAGAR') {
  const client = await create(api, cleanup, '/cliente', { cnpj: unique, razaoSocial: `Empresa ${unique}`, nomeFantasia: `Empresa ${unique}` });
  const roots = await (await api.get('/plano-de-contas?limit=100')).json();
  const root = roots.data.find((item: any) => item.codigo === '4');
  expect(root, 'Synthetic root seeded in isolated database').toBeTruthy();
  const plan = await create(api, cleanup, '/plano-de-contas', { nome: `Plano ${unique}`, tipo: 'DESPESA', natureza: 'ANALITICA', contaPaiId: root.id });
  const data = { tipo, descricao: `Conta ${unique}`, valorOriginal: '100.00', dataEmissao: today(), dataVencimento: today(), clienteId: client.id, planoDeContaId: plan.id };
  return { record: await create(api, cleanup, '/contas', data), data, client, plan };
}
async function balance(api: APIRequestContext, id: number) {
  const response = await api.get(`/movimentacoes/saldos?contaBancariaId=${id}`);
  expect(response.status(), await response.text()).toBe(200);
  return (await response.json())[0].saldo;
}

test('API financeira: entrada, saída, transferência e estorno preservam saldos', async ({ api, cleanup, unique }) => {
  const origin = await bank(api, cleanup, `${unique}-a`);
  const destination = await bank(api, cleanup, `${unique}-b`);
  await create(api, cleanup, '/movimentacoes', { tipo: 'ENTRADA', descricao: unique, valor: '100.00', data: today(), contaDestinoId: origin.id });
  await create(api, cleanup, '/movimentacoes', { tipo: 'SAIDA', descricao: unique, valor: '20.00', data: today(), contaOrigemId: origin.id });
  const transfer = await create(api, cleanup, '/movimentacoes', { tipo: 'TRANSFERENCIA', descricao: unique, valor: '30.00', data: today(), contaOrigemId: origin.id, contaDestinoId: destination.id });
  expect(await balance(api, origin.id)).toBe('50.00');
  expect(await balance(api, destination.id)).toBe('30.00');
  const response = await api.post(`/movimentacoes/${transfer.id}/estornar`);
  expect(response.status(), await response.text()).toBe(201);
  const reversal = await response.json();
  cleanup.push({ endpoint: '/movimentacoes', id: reversal.id });
  expect(reversal).toMatchObject({ origem: 'ESTORNO', estornoDeId: transfer.id, contaOrigemId: destination.id, contaDestinoId: origin.id });
  expect(await balance(api, origin.id)).toBe('80.00');
  expect(await balance(api, destination.id)).toBe('0.00');
  expect((await api.post(`/movimentacoes/${transfer.id}/estornar`)).status()).toBe(409);
});

for (const tipo of ['PAGAR', 'RECEBER']) {
  test(`API financeira: liquidar e estornar conta a ${tipo.toLowerCase()}`, async ({ api, cleanup, unique }) => {
    const { record } = await account(api, cleanup, unique, tipo);
    const financial = await bank(api, cleanup, unique);
    const method = await create(api, cleanup, '/formas-recebimento', { nome: `Forma ${unique}` });
    const response = await api.post(`/contas/${record.id}/liquidar`, { data: { dataPagamento: today(), contaBancariaId: financial.id, formaRecebimentoId: method.id } });
    expect(response.status(), await response.text()).toBe(201);
    const paid = await response.json();
    cleanup.push({ endpoint: '/liquidacoes', id: paid.liquidacao.id }, { endpoint: '/movimentacoes', id: paid.movimento.id });
    expect(paid.conta.situacao).toBe('LIQUIDADA');
    expect(paid.liquidacao.valorTotal).toBe('100.00');
    expect(await balance(api, financial.id)).toBe(tipo === 'PAGAR' ? '-100.00' : '100.00');
    expect((await api.patch(`/contas/${record.id}`, { data: { descricao: 'Não pode editar' } })).status()).toBe(409);
    const duplicate = await api.post(`/contas/${record.id}/liquidar`, { data: { dataPagamento: today(), contaBancariaId: financial.id, formaRecebimentoId: method.id } });
    expect(duplicate.status()).toBe(409);
    const undone = await api.post(`/contas/${record.id}/estornar`);
    expect(undone.status(), await undone.text()).toBe(201);
    const body = await undone.json();
    cleanup.push({ endpoint: '/movimentacoes', id: body.estorno.id });
    expect(body.conta.situacao).toBe('ABERTA');
    expect(await balance(api, financial.id)).toBe('0.00');
    const persisted = await (await api.get(`/contas/${record.id}`)).json();
    expect(persisted.liquidacoes[0].estornadaEm).toBeTruthy();
    expect((await api.delete(`/contas/${record.id}`)).status()).toBe(409);
  });
}

test('API financeira: editar, filtrar e cancelar conta aberta', async ({ api, cleanup, unique }) => {
  const { record, client } = await account(api, cleanup, unique);
  const edited = await api.patch(`/contas/${record.id}`, { data: { descricao: `Editado ${unique}`, valorOriginal: '120.50' } });
  expect(edited.status()).toBe(200);
  const filtered = await api.get(`/contas?clienteId=${client.id}&situacao=ABERTA`);
  expect(filtered.status()).toBe(200);
  expect((await filtered.json()).data).toEqual([expect.objectContaining({ id: record.id, valorOriginal: '120.50' })]);
  const cancelled = await api.post(`/contas/${record.id}/cancelar`);
  expect(cancelled.status()).toBe(201);
  expect((await (await api.get(`/contas/${record.id}`)).json()).situacao).toBe('CANCELADA');
  expect((await api.patch(`/contas/${record.id}`, { data: { descricao: 'Bloqueado' } })).status()).toBe(409);
});

test('API financeira: valor zero e referência inativa são rejeitados', async ({ api, cleanup, unique }) => {
  const { data, client } = await account(api, cleanup, unique);
  expect((await api.post('/contas', { data: { ...data, valorOriginal: '0' } })).status()).toBe(400);
  expect((await api.delete(`/cliente/${client.id}`)).status()).toBe(200);
  const response = await api.post('/contas', { data });
  expect(response.status()).toBe(400);
  expect((await response.json()).message).toBe('Cliente inexistente ou inativo.');
});

test('API financeira: transferência na mesma conta e data futura são rejeitadas', async ({ api, cleanup, unique }) => {
  const financial = await bank(api, cleanup, unique);
  const same = await api.post('/movimentacoes', { data: { tipo: 'TRANSFERENCIA', descricao: unique, valor: '10.00', data: today(), contaOrigemId: financial.id, contaDestinoId: financial.id } });
  expect(same.status()).toBe(400);
  const future = await api.post('/movimentacoes', { data: { tipo: 'ENTRADA', descricao: unique, valor: '10.00', data: '2999-01-01', contaDestinoId: financial.id } });
  expect(future.status()).toBe(400);
  expect(await balance(api, financial.id)).toBe('0.00');
});

test('API de plano de contas gera código filho e impede alterar pai ou natureza', async ({ api, cleanup, unique }) => {
  const { plan } = await account(api, cleanup, unique);
  expect(plan.codigo).toMatch(/^4\.\d+$/);
  expect((await api.patch(`/plano-de-contas/${plan.id}`, { data: { natureza: 'SINTETICA' } })).status()).toBe(422);
  expect((await api.patch(`/plano-de-contas/${plan.id}`, { data: { codigo: '9.9' } })).status()).toBe(400);
  const persisted = await (await api.get(`/plano-de-contas/${plan.id}`)).json();
  expect(persisted).toMatchObject({ codigo: plan.codigo, natureza: 'ANALITICA' });
});
