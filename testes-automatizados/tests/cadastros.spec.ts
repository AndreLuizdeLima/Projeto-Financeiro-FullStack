import { test, expect, signIn, create } from './fixtures';

const modules = [
  { route: '/clientes', endpoint: '/cliente', title: 'Clientes', key: 'razaoSocial', fields: { cnpj: ['CNPJ', '12345678000190'], razaoSocial: ['Razão social', 'Empresa E2E'], nomeFantasia: ['Nome fantasia', 'Fantasia E2E'] }, reactivate: true },
  { route: '/centros-de-custo', endpoint: '/centro-de-custo', title: 'Centros de custo', key: 'nome', fields: { nome: ['Nome', 'Centro E2E'] }, reactivate: true },
  { route: '/formas-de-recebimento', endpoint: '/formas-recebimento', title: 'Formas de recebimento', key: 'nome', fields: { nome: ['Nome', 'Forma E2E'] }, reactivate: true },
  { route: '/contas-bancarias', endpoint: '/conta-bancaria', title: 'Contas bancárias', key: 'nome', fields: { nome: ['Nome', 'Banco E2E'], conta: ['Conta', '12345-6'] }, reactivate: true },
  { route: '/usuarios', endpoint: '/users', title: 'Usuários', key: 'nome', fields: { nome: ['Nome', 'Pessoa E2E'], email: ['E-mail', 'pessoa@fluxo.test'], password: ['Senha', 'SenhaE2E123!'], confirmacao: ['Confirme a senha', 'SenhaE2E123!'] }, reactivate: false },
] as const;

for (const module of modules) {
  test.describe(module.title, () => {
    test.beforeEach(async ({ page, tokens }) => { await signIn(page, tokens); await page.goto(module.route); });

    test('criar, consultar, editar e inativar com persistência real', async ({ page, api, unique }) => {
      await expect(page.getByRole('heading', { name: module.title, exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Novo cadastro', exact: true }).click();
      const dialog = page.getByRole('dialog');
      const payload: Record<string, string> = {};
      for (const [key, [label, initial]] of Object.entries(module.fields)) {
        const value = key === module.key ? `${initial} ${unique}` : key === 'email' ? `pessoa-${unique}@fluxo.test` : initial;
        await dialog.getByLabel(label, { exact: true }).fill(value);
        if (key !== 'confirmacao') payload[key] = value;
      }
      if (module.route === '/contas-bancarias') { await dialog.getByLabel('Tipo', { exact: true }).selectOption('ContaPoupanca'); payload.tipo = 'ContaPoupanca'; }
      const saved = page.waitForResponse(r => new URL(r.url()).pathname === module.endpoint && r.request().method() === 'POST');
      await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
      const response = await saved;
      expect(response.status(), await response.text()).toBe(201);
      const record = await response.json();
      await expect(dialog).toHaveCount(0);
      let row = page.getByRole('row').filter({ hasText: payload[module.key] });
      await expect(row).toBeVisible();
      await page.reload();
      await expect(row).toBeVisible();
      expect(await (await api.get(`${module.endpoint}/${record.id}`)).json()).toMatchObject({ ...Object.fromEntries(Object.entries(payload).filter(([key]) => key !== 'password')), isActive: true });

      await row.getByRole('button', { name: 'Visualizar', exact: true }).click();
      await expect(dialog.getByLabel(module.fields[module.key][0], { exact: true })).toHaveValue(payload[module.key]);
      await expect(dialog.getByLabel(module.fields[module.key][0], { exact: true })).toHaveAttribute('readonly', '');
      await expect(dialog.getByRole('button', { name: 'Salvar', exact: true })).toHaveCount(0);
      await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();

      await row.getByRole('button', { name: 'Editar', exact: true }).click();
      const renamed = `${payload[module.key]} editado`;
      await dialog.getByLabel(module.fields[module.key][0], { exact: true }).fill(renamed);
      await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
      await expect(dialog).toHaveCount(0);
      row = page.getByRole('row').filter({ hasText: renamed });
      await expect(row).toBeVisible();
      await page.reload();
      await expect(row).toBeVisible();
      expect(await (await api.get(`${module.endpoint}/${record.id}`)).json()).toMatchObject({ [module.key]: renamed });

      await row.getByRole('button', { name: 'Inativar', exact: true }).click();
      await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();
      await expect(row.getByText('Ativo', { exact: true })).toBeVisible();
      await row.getByRole('button', { name: 'Inativar', exact: true }).click();
      await dialog.getByRole('button', { name: 'Confirmar inativação', exact: true }).click();
      await expect(row.getByText('Inativo', { exact: true })).toBeVisible();
      await page.reload();
      await expect(row.getByText('Inativo', { exact: true })).toBeVisible();
      expect(await (await api.get(`${module.endpoint}/${record.id}`)).json()).toMatchObject({ isActive: false });
      if (module.reactivate) {
        await row.getByRole('button', { name: 'Reativar', exact: true }).click();
        await expect(row.getByText('Ativo', { exact: true })).toBeVisible();
        await page.reload();
        await expect(row.getByText('Ativo', { exact: true })).toBeVisible();
        expect(await (await api.get(`${module.endpoint}/${record.id}`)).json()).toMatchObject({ isActive: true });
      } else {
        await expect(row.getByRole('button', { name: 'Editar', exact: true })).toHaveCount(0);
        await expect(row.getByRole('button', { name: 'Reativar', exact: true })).toHaveCount(0);
      }
    });

    test('campos vazios mostram validação e não criam registro', async ({ page }) => {
      let writes = 0;
      page.on('request', r => { if (r.method() === 'POST' && new URL(r.url()).pathname === module.endpoint) writes++; });
      await page.getByRole('button', { name: 'Novo cadastro', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
      await expect(dialog.getByLabel(module.fields[module.key][0], { exact: true })).toHaveAttribute('aria-invalid', 'true');
      await expect(dialog.getByText('Preencha este campo.', { exact: true }).first()).toBeVisible();
      expect(writes).toBe(0);
    });

    test('cancelar formulário não grava dados', async ({ page }) => {
      let writes = 0;
      page.on('request', r => { if (r.method() === 'POST' && new URL(r.url()).pathname === module.endpoint) writes++; });
      await page.getByRole('button', { name: 'Novo cadastro', exact: true }).click();
      await page.getByRole('dialog').getByLabel(module.fields[module.key][0], { exact: true }).fill('Não salvar');
      await page.getByRole('dialog').getByRole('button', { name: 'Fechar', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(writes).toBe(0);
    });
  });
}

test('cadastro de usuário valida e-mail e confirmação de senha', async ({ page, tokens }) => {
  await signIn(page, tokens);
  await page.goto('/usuarios');
  await page.getByRole('button', { name: 'Novo cadastro', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nome', { exact: true }).fill('Pessoa teste');
  await dialog.getByLabel('E-mail', { exact: true }).fill('invalido');
  await dialog.getByLabel('Senha', { exact: true }).fill('Senha123!');
  await dialog.getByLabel('Confirme a senha', { exact: true }).fill('Diferente');
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(dialog.getByText('Informe um e-mail válido.', { exact: true })).toBeVisible();
  await expect(dialog.getByText('As senhas devem ser iguais.', { exact: true })).toBeVisible();
});

test('e-mail duplicado mostra conflito real da API mantendo o formulário', async ({ page, tokens }) => {
  const { credentials } = await import('./fixtures');
  await signIn(page, tokens);
  await page.goto('/usuarios');
  await page.getByRole('button', { name: 'Novo cadastro', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nome', { exact: true }).fill('Duplicado');
  await dialog.getByLabel('E-mail', { exact: true }).fill(credentials.email);
  await dialog.getByLabel('Senha', { exact: true }).fill('Senha123!');
  await dialog.getByLabel('Confirme a senha', { exact: true }).fill('Senha123!');
  const response = page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname === '/users');
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
  expect((await response).status()).toBe(409);
  await expect(dialog.getByRole('alert')).toHaveText('Já existe um usuário com este e-mail.');
  await expect(dialog.getByLabel('Nome', { exact: true })).toHaveValue('Duplicado');
});

test('paginação real avança e retorna sem perder registros', async ({ page, api, cleanup, tokens, unique }) => {
  for (let index = 0; index < 21; index++) await create(api, cleanup, '/centro-de-custo', { nome: `Página ${unique} ${index}` });
  await signIn(page, tokens);
  await page.goto('/centros-de-custo');
  await expect(page.getByText(/Página 1 ·/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Anterior', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(page.getByText(/Página 2 ·/)).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: `Página ${unique} 0` })).toBeVisible();
  await page.getByRole('button', { name: 'Anterior', exact: true }).click();
  await expect(page.getByText(/Página 1 ·/)).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: `Página ${unique} 20` })).toBeVisible();
});
