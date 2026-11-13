import { test as base, expect, type APIRequestContext } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

export const apiURL = process.env.API_URL || 'http://127.0.0.1:4300';
if (apiURL !== 'http://127.0.0.1:4300') throw new Error('This suite writes test data and requires the isolated backend at http://127.0.0.1:4300.');
export const credentials: { email: string; password: string } = process.env.TEST_EMAIL && process.env.TEST_PASSWORD
  ? { email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD }
  : JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.cache/credentials.json'), 'utf8'));
const tables: Record<string, string> = {
  '/cliente': 'cliente', '/centro-de-custo': 'centro_de_custo',
  '/formas-recebimento': 'formas_recebimento', '/conta-bancaria': 'conta_bancaria', '/users': 'user',
  '/plano-de-contas': 'plano_de_conta', '/contas': 'contas', '/liquidacoes': 'liquidacoes', '/movimentacoes': 'movimentacoes',
};
export const test = base.extend<{
  api: APIRequestContext;
  tokens: { accessToken: string; refreshToken: string };
  unique: string;
  cleanup: Array<{ endpoint: string; id: number }>;
}>({
  unique: async ({}, use) => { await use(randomUUID().slice(0, 12)); },
  cleanup: async ({}, use) => {
    const records: Array<{ endpoint: string; id: number }> = [];
    await use(records);
    if (!records.length) return;
    // Cleanup is allowed only against the disposable local database created by env:start.
    if (apiURL !== 'http://127.0.0.1:4300') throw new Error('Cleanup requires the isolated local test backend.');
    const db = new Client({ host: '127.0.0.1', port: 55432, user: 'fluxo_test', database: 'fluxo_e2e' });
    await db.connect();
    try {
      for (const record of records.reverse()) {
        const table = tables[record.endpoint];
        if (!table || !Number.isInteger(record.id)) throw new Error('Invalid cleanup record');
        await db.query(`DELETE FROM "${table}" WHERE id = $1`, [record.id]);
      }
    } finally { await db.end(); }
  },
  tokens: async ({ request }, use) => {
    const response = await request.post(`${apiURL}/auth/login`, { data: credentials });
    expect(response.status(), await response.text()).toBe(201);
    await use(await response.json());
  },
  api: async ({ playwright, tokens }, use) => {
    const api = await playwright.request.newContext({ baseURL: apiURL, extraHTTPHeaders: { Authorization: `Bearer ${tokens.accessToken}` } });
    await use(api);
    await api.dispose();
  },
  page: async ({ page, cleanup }, use) => {
    const pending: Promise<void>[] = [];
    page.on('response', response => {
      const endpoint = new URL(response.url()).pathname;
      if (response.request().method() === 'POST' && response.status() === 201 && tables[endpoint]) {
        pending.push(response.json().then(body => { cleanup.push({ endpoint, id: body.id }); }));
      }
    });
    await use(page);
    await Promise.all(pending);
  },
});
export { expect };
export async function signIn(page: import('@playwright/test').Page, tokens: { accessToken: string; refreshToken: string }) {
  await page.addInitScript(value => {
    if (!sessionStorage.getItem('e2e-initialized')) {
      localStorage.setItem('fluxo.auth', JSON.stringify(value));
      sessionStorage.setItem('e2e-initialized', 'yes');
    }
  }, tokens);
}
export async function create(api: APIRequestContext, cleanup: Array<{ endpoint: string; id: number }>, endpoint: string, data: object) {
  const response = await api.post(endpoint, { data });
  expect(response.status(), await response.text()).toBe(201);
  const record = await response.json();
  cleanup.push({ endpoint, id: record.id });
  return record;
}
