import type { MigrationInterface, QueryRunner } from 'typeorm';
import { hash } from 'bcryptjs';
import { isEmail } from 'class-validator';

export class DadosIniciais1795315667633 implements MigrationInterface {
  name = 'DadosIniciais1795315667633';

  async up(queryRunner: QueryRunner): Promise<void> {
    const nome = process.env.SEED_ADMIN_NOME?.trim() || 'Administrador';
    const email = process.env.SEED_ADMIN_EMAIL?.trim();
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (
      nome.length > 100 ||
      !email ||
      !isEmail(email) ||
      !password ||
      password.length < 12 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      throw new Error(
        'Defina nome válido, e-mail válido e senha inicial com pelo menos 12 caracteres e no máximo 72 bytes.',
      );
    }
    const usuarios = (await queryRunner.query(
      'INSERT INTO "user" ("nome", "email", "passwordHash", "isActive") VALUES ($1, $2, $3, true) RETURNING "id"',
      [nome, email, await hash(password, 10)],
    )) as { id: number }[];
    const usuarioId = usuarios[0].id;
    const raizes = [
      ['1', 'Ativo', 'ATIVO'],
      ['2', 'Passivo', 'PASSIVO'],
      ['3', 'Receitas', 'RECEITA'],
      ['4', 'Despesas', 'DESPESA'],
    ];
    for (const [codigo, titulo, tipo] of raizes) {
      await queryRunner.query(
        'INSERT INTO "plano_de_conta" ("codigo", "nome", "tipo", "natureza", "isActive", "criadoPorId") VALUES ($1, $2, $3, $4, true, $5)',
        [codigo, titulo, tipo, 'SINTETICA', usuarioId],
      );
    }
    for (const [codigo, titulo, tipo, pai] of [
      ['3.1', 'Receitas gerais', 'RECEITA', '3'],
      ['4.1', 'Despesas gerais', 'DESPESA', '4'],
    ]) {
      await queryRunner.query(
        'INSERT INTO "plano_de_conta" ("codigo", "nome", "tipo", "natureza", "isActive", "contaPaiId", "criadoPorId") SELECT $1, $2, $3, $4, true, "id", $5 FROM "plano_de_conta" WHERE "codigo" = $6',
        [codigo, titulo, tipo, 'ANALITICA', usuarioId, pai],
      );
    }
    await queryRunner.query(
      'INSERT INTO "centro_de_custo" ("nome", "isActive", "criadoPorId") VALUES ($1, true, $2)',
      ['Geral', usuarioId],
    );
    for (const forma of ['Pix', 'Dinheiro', 'Transferência bancária']) {
      await queryRunner.query(
        'INSERT INTO "formas_recebimento" ("nome", "isActive", "criadoPorId") VALUES ($1, true, $2)',
        [forma, usuarioId],
      );
    }
  }

  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'Os dados iniciais não são removidos automaticamente. Restaure um backup se necessário.',
      ),
    );
  }
}
