import { test, expect, signIn, create, apiURL } from './fixtures';

const routes = [
  ['Dashboard', '/', 'Resumo financeiro'],
  ['Centros de custo', '/centros-de-custo', 'Centros de custo'],
  ['Formas de recebimento', '/formas-de-recebimento', 'Formas de recebimento'],
  ['Clientes', '/clientes', 'Clientes'],
  ['Contas bancárias', '/contas-bancarias', 'Contas bancárias'],
  ['Usuários', '/usuarios', 'Usuários'],
];
for (const [label, route, heading] of routes) {
  test(`menu navega para ${label}`, async ({ page, tokens }) => {
    await signIn(page, tokens);
    await page.goto('/clientes');
    await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: label, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe(route);
  });
}

test('dashboard mostra totais calculados pelas movimentações reais', async ({ page, api, cleanup, tokens, unique }) => {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const month = date.slice(0, 7);
  const baseline = await (await api.get(`/dashboard?mes=${month}`)).json();
  const bank = await create(api, cleanup, '/conta-bancaria', { nome: `Dashboard ${unique}`, conta: unique, tipo: 'ContaCorrente' });
  await create(api, cleanup, '/movimentacoes', { tipo: 'ENTRADA', descricao: unique, valor: '125.50', data: date, contaDestinoId: bank.id });
  await create(api, cleanup, '/movimentacoes', { tipo: 'SAIDA', descricao: unique, valor: '25.25', data: date, contaOrigemId: bank.id });
  await signIn(page, tokens);
  await page.goto(`/?mes=${month}`);
  const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  for (const [label, expected] of [['Receitas', baseline.receita + 125.50], ['Despesas', baseline.despesas + 25.25], ['Saldo do mês', baseline.saldo + 100.25]] as const) {
    await expect(page.getByText(label, { exact: true }).locator('..')).toContainText(money(expected));
  }
  await expect(page.getByRole('img', { name: 'Gráfico de evolução do saldo acumulado por período' })).toBeVisible();
  const real = await (await api.get(`/dashboard?mes=${month}`)).json();
  expect(real).toEqual({ receita: baseline.receita + 125.50, despesas: baseline.despesas + 25.25, saldo: baseline.saldo + 100.25 });
  await page.reload();
  await expect(page.getByText('Saldo do mês', { exact: true }).locator('..')).toContainText(money(real.saldo));
});

test('dashboard futuro apresenta ausência de evolução sem erro', async ({ page, tokens }) => {
  await signIn(page, tokens);
  await page.goto('/?mes=2999-01');
  await expect(page.getByText('Janeiro de 2999', { exact: true })).toBeVisible();
  await expect(page.getByText('Não há evolução de saldo disponível para este mês.', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('mês inválido na URL é normalizado para o mês atual', async ({ page, tokens }) => {
  await signIn(page, tokens);
  await page.goto('/?mes=2026-13');
  const current = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).format(new Date());
  await expect(page).toHaveURL(new RegExp(`mes=${current}$`));
  await expect(page.getByRole('heading', { name: 'Resumo financeiro' })).toBeVisible();
});

test('rota desconhecida redireciona para o dashboard', async ({ page, tokens }) => {
  await signIn(page, tokens);
  await page.goto('/rota-inexistente');
  await expect(page.getByRole('heading', { name: 'Resumo financeiro' })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/');
});

test('menu móvel permite abrir Clientes', async ({ page, tokens }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, tokens);
  await page.goto('/');
  await page.getByRole('button', { name: 'Alternar menu lateral' }).click();
  await page.getByRole('link', { name: 'Clientes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Clientes', exact: true })).toBeVisible();
});

for (const endpoint of ['/users', '/cliente', '/conta-bancaria', '/centro-de-custo', '/formas-recebimento', '/contas', '/movimentacoes', '/dashboard?mes=2026-10']) {
  test(`API ${endpoint} rejeita acesso sem token`, async ({ request }) => {
    const response = await request.get(`${apiURL}${endpoint}`);
    expect(response.status()).toBe(401);
  });
}

test('API impede inativar o próprio usuário autenticado', async ({ api, tokens }) => {
  const payload = JSON.parse(Buffer.from(tokens.accessToken.split('.')[1], 'base64url').toString());
  const response = await api.delete(`/users/${payload.sub}`);
  expect(response.status()).toBe(403);
  expect((await response.json()).message).toBe('Não é permitido inativar o próprio usuário.');
  expect((await (await api.get(`/users/${payload.sub}`)).json()).isActive).toBe(true);
});
