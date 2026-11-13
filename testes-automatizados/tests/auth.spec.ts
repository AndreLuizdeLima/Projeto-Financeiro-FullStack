import { test, expect, apiURL, credentials, signIn, create } from './fixtures';

test('login exige e-mail e senha sem enviar requisição vazia', async ({ page }) => {
  const sent: string[] = [];
  page.on('request', request => { if (request.url().endsWith('/auth/login')) sent.push(request.url()); });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByLabel('E-mail', { exact: true })).toBeFocused();
  expect(await page.getByLabel('E-mail', { exact: true }).evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(true);
  expect(sent).toHaveLength(0);
});

test('login rejeita endereço de e-mail inválido no navegador', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('invalido');
  await page.getByLabel('Senha', { exact: true }).fill('teste');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  expect(await page.getByLabel('E-mail', { exact: true }).evaluate((element: HTMLInputElement) => element.validity.typeMismatch)).toBe(true);
  await expect(page).toHaveURL(/\/login$/);
});

test('credenciais incorretas exibem erro e não criam sessão', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(credentials.email);
  await page.getByLabel('Senha', { exact: true }).fill('senha-incorreta');
  const response = page.waitForResponse(r => r.url().endsWith('/auth/login'));
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  expect((await response).status()).toBe(401);
  await expect(page.getByText('Credenciais inválidas.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('fluxo.auth'))).toBeNull();
});

test('login real abre dashboard e mantém sessão após recarregar', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(credentials.email);
  await page.getByLabel('Senha', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Resumo financeiro' })).toBeVisible();
  const refresh = page.waitForResponse(r => r.url().endsWith('/auth/refresh'));
  await page.reload();
  expect((await refresh).status()).toBe(201);
  await expect(page.getByRole('heading', { name: 'Resumo financeiro' })).toBeVisible();
});

test('sessão válida redireciona da tela de login para o dashboard', async ({ page, tokens }) => {
  await signIn(page, tokens);
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Resumo financeiro' })).toBeVisible();
  await expect(page).not.toHaveURL(/\/login$/);
});

test('refresh token inválido limpa sessão e volta ao login', async ({ page }) => {
  await signIn(page, { accessToken: 'invalido', refreshToken: 'invalido' });
  await page.goto('/clientes');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('fluxo.auth'))).toBeNull();
});

test('armazenamento corrompido não quebra a tela de login', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('fluxo.auth', '{quebrado'));
  await page.goto('/clientes');
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
});

test('sair encerra a sessão e impede retorno à página protegida', async ({ page, tokens }) => {
  await signIn(page, tokens);
  await page.goto('/clientes');
  await page.getByRole('button', { name: 'A', exact: true }).click();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('fluxo.auth'))).toBeNull();
  await page.goto('/clientes');
  await expect(page).toHaveURL(/\/login$/);
});

test('usuário inativado não consegue efetuar login real', async ({ page, api, cleanup, unique }) => {
  const data = { nome: `Inativo ${unique}`, email: `inativo-${unique}@fluxo.test`, password: `Senha-${unique}` };
  const user = await create(api, cleanup, '/users', data);
  expect((await api.delete(`/users/${user.id}`)).ok()).toBe(true);
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(data.email);
  await page.getByLabel('Senha', { exact: true }).fill(data.password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText('Credenciais inválidas.', { exact: true })).toBeVisible();
});

test('API rejeita token de acesso como refresh token', async ({ request, tokens }) => {
  const response = await request.post(`${apiURL}/auth/refresh`, { data: { refreshToken: tokens.accessToken } });
  expect(response.status()).toBe(401);
});

for (const route of ['/', '/clientes', '/usuarios', '/contas-bancarias', '/centros-de-custo', '/formas-de-recebimento']) {
  test(`rota ${route} exige autenticação`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
  });
}
