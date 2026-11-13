import { test, expect, create } from './fixtures';

for (const endpoint of ['/cliente', '/centro-de-custo', '/formas-recebimento', '/conta-bancaria']) {
  test(`segurança: POST ${endpoint} não expõe hash de senha do criador`, async ({ api, cleanup, unique }) => {
    const data = endpoint === '/cliente'
      ? { cnpj: unique, razaoSocial: `Segurança ${unique}`, nomeFantasia: unique }
      : endpoint === '/conta-bancaria'
        ? { nome: `Segurança ${unique}`, conta: unique, tipo: 'ContaCorrente' }
        : { nome: `Segurança ${unique}` };
    const record = await create(api, cleanup, endpoint, data);
    // Report only the existence of the sensitive field, never its contents.
    expect(Object.hasOwn(record.criadoPor ?? {}, 'passwordHash'), 'A resposta pública não deve incluir criadoPor.passwordHash').toBe(false);
  });
}
