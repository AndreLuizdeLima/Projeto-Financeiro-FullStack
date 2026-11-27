import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImplantacaoInicial1795315667632 implements MigrationInterface {
  name = 'ImplantacaoInicial1795315667632';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "centro_de_custo" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "isActive" boolean NOT NULL, "criadoPorId" integer NOT NULL, CONSTRAINT "PK_9f53b81e2d0abd09262adff8227" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cliente" ("id" SERIAL NOT NULL, "nomeFantasia" character varying(100) NOT NULL, "razaoSocial" character varying(100) NOT NULL, "cnpj" character varying NOT NULL, "isActive" boolean NOT NULL, "criadoPorId" integer NOT NULL, CONSTRAINT "PK_18990e8df6cf7fe71b9dc0f5f39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."conta_bancaria_tipo_enum" AS ENUM('ContaCorrente', 'ContaPoupanca', 'ContaSalario')`,
    );
    await queryRunner.query(
      `CREATE TABLE "conta_bancaria" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "conta" character varying NOT NULL, "isActive" boolean NOT NULL, "tipo" "public"."conta_bancaria_tipo_enum" NOT NULL, "criadoPorId" integer NOT NULL, CONSTRAINT "PK_ae03c5239215700fc0955d26787" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "formas_recebimento" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "isActive" boolean NOT NULL, "criadoPorId" integer NOT NULL, CONSTRAINT "PK_3667b2b3a74f9a22a5f36b332ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plano_de_conta_tipo_enum" AS ENUM('RECEITA', 'DESPESA', 'ATIVO', 'PASSIVO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plano_de_conta_natureza_enum" AS ENUM('SINTETICA', 'ANALITICA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "plano_de_conta" ("id" SERIAL NOT NULL, "codigo" character varying(255) NOT NULL, "nome" character varying NOT NULL, "tipo" "public"."plano_de_conta_tipo_enum" NOT NULL, "natureza" "public"."plano_de_conta_natureza_enum" NOT NULL, "isActive" boolean NOT NULL, "contaPaiId" integer, "criadoPorId" integer NOT NULL, CONSTRAINT "UQ_1c8938f48c2b36aba52e1e8f098" UNIQUE ("codigo"), CONSTRAINT "PK_3f0e2dbf9a5d31ea5f2d3c394ec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "nome" character varying(100) NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createDate" TIMESTAMP NOT NULL DEFAULT now(), "updateDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contas_tipo_enum" AS ENUM('PAGAR', 'RECEBER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contas_situacao_enum" AS ENUM('ABERTA', 'LIQUIDADA', 'CANCELADA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contas" ("id" SERIAL NOT NULL, "tipo" "public"."contas_tipo_enum" NOT NULL, "descricao" character varying NOT NULL, "valorOriginal" numeric(19,2) NOT NULL, "taxaJurosDiaria" numeric(9,6) NOT NULL DEFAULT '0', "taxaMulta" numeric(9,6) NOT NULL DEFAULT '0', "dataEmissao" date NOT NULL, "dataVencimento" date NOT NULL, "situacao" "public"."contas_situacao_enum" NOT NULL DEFAULT 'ABERTA', "clienteId" integer NOT NULL, "planoDeContaId" integer NOT NULL, "centroDeCustoId" integer, "criadoPorId" integer NOT NULL, "criadoEm" TIMESTAMP NOT NULL DEFAULT now(), "atualizadoEm" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_42ed8e2a49075843ee71b5a7a8" CHECK ("valorOriginal" > 0), CONSTRAINT "PK_f5a347b0829de9a7a38cf1d052f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_37e8a75da66c746f28426ae688" ON "contas"  ("dataVencimento") `,
    );
    await queryRunner.query(
      `CREATE TABLE "liquidacoes" ("id" SERIAL NOT NULL, "contaId" integer NOT NULL, "dataPagamento" date NOT NULL, "valorOriginal" numeric(19,2) NOT NULL, "taxaJurosDiaria" numeric(9,6) NOT NULL, "taxaMulta" numeric(9,6) NOT NULL, "diasAtraso" integer NOT NULL, "juros" numeric(19,2) NOT NULL, "multa" numeric(19,2) NOT NULL, "valorTotal" numeric(19,2) NOT NULL, "formaRecebimentoId" integer NOT NULL, "contaBancariaId" integer NOT NULL, "criadoPorId" integer NOT NULL, "estornadaEm" TIMESTAMP WITH TIME ZONE, "estornadoPorId" integer, "criadoEm" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2dfac78781eb5fcf2ca0c4a7ee9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "liquidacao_ativa_unica" ON "liquidacoes"  ("contaId") WHERE "estornadaEm" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."movimentacoes_tipo_enum" AS ENUM('ENTRADA', 'SAIDA', 'TRANSFERENCIA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."movimentacoes_origem_enum" AS ENUM('AVULSA', 'SALDO_INICIAL', 'LIQUIDACAO', 'ESTORNO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "movimentacoes" ("id" SERIAL NOT NULL, "tipo" "public"."movimentacoes_tipo_enum" NOT NULL, "origem" "public"."movimentacoes_origem_enum" NOT NULL, "descricao" character varying NOT NULL, "valor" numeric(19,2) NOT NULL, "data" date NOT NULL, "contaOrigemId" integer, "contaDestinoId" integer, "liquidacaoId" integer, "clienteId" integer, "planoDeContaId" integer, "centroDeCustoId" integer, "formaRecebimentoId" integer, "estornoDeId" integer, "criadoPorId" integer NOT NULL, "criadoEm" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_6057b1c7f78ed41c634710e976" CHECK (("tipo" = 'ENTRADA' AND "contaOrigemId" IS NULL AND "contaDestinoId" IS NOT NULL) OR ("tipo" = 'SAIDA' AND "contaOrigemId" IS NOT NULL AND "contaDestinoId" IS NULL) OR ("tipo" = 'TRANSFERENCIA' AND "contaOrigemId" IS NOT NULL AND "contaDestinoId" IS NOT NULL AND "contaOrigemId" <> "contaDestinoId")), CONSTRAINT "CHK_36a39d4e0f1ca25380e8c55b16" CHECK ("valor" > 0), CONSTRAINT "PK_1d0b888647c176e4c3d6905d3ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e7a7e1682b93eabd968685ad51" ON "movimentacoes"  ("data") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "movimento_liquidacao_unico" ON "movimentacoes"  ("liquidacaoId") WHERE "estornoDeId" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "movimento_estorno_unico" ON "movimentacoes"  ("estornoDeId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "centro_de_custo" ADD CONSTRAINT "FK_239e5f3e8d34207d3be6a7e31cd" FOREIGN KEY ("criadoPorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD CONSTRAINT "FK_dbaf0b6f3e6105d2ab7aa40b874" FOREIGN KEY ("criadoPorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conta_bancaria" ADD CONSTRAINT "FK_28e65d2a47aabcdd3439c2b71e0" FOREIGN KEY ("criadoPorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "formas_recebimento" ADD CONSTRAINT "FK_55dc26cfc75e85147f3bf1e7c95" FOREIGN KEY ("criadoPorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plano_de_conta" ADD CONSTRAINT "FK_33a400dfdb4ae0e5ff9827398d1" FOREIGN KEY ("contaPaiId") REFERENCES "plano_de_conta"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plano_de_conta" ADD CONSTRAINT "FK_61a03ed80ce32150e997b08bc7d" FOREIGN KEY ("criadoPorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contas" ADD CONSTRAINT "FK_2eae824c96ec37f6a3d0ad601ad" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contas" ADD CONSTRAINT "FK_3867268c3ba3293564f9357ee39" FOREIGN KEY ("planoDeContaId") REFERENCES "plano_de_conta"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contas" ADD CONSTRAINT "FK_69eb3fe3936765b019271ea96c8" FOREIGN KEY ("centroDeCustoId") REFERENCES "centro_de_custo"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contas" ADD CONSTRAINT "FK_80265f7d93054f592cb35312196" FOREIGN KEY ("criadoPorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "liquidacoes" ADD CONSTRAINT "FK_4630896a67826e8338e157ec3fe" FOREIGN KEY ("contaId") REFERENCES "contas"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "liquidacoes" ADD CONSTRAINT "FK_03579b4295258effb62d42afd32" FOREIGN KEY ("formaRecebimentoId") REFERENCES "formas_recebimento"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "liquidacoes" ADD CONSTRAINT "FK_b1fa9a35d4b433eed66d7d3e47a" FOREIGN KEY ("contaBancariaId") REFERENCES "conta_bancaria"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "liquidacoes" ADD CONSTRAINT "FK_60b053966ed40b8c565002b466b" FOREIGN KEY ("criadoPorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "liquidacoes" ADD CONSTRAINT "FK_693f08951cad7685dc777839b22" FOREIGN KEY ("estornadoPorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" ADD CONSTRAINT "FK_b35ba2e1232d8d13e188025bf9f" FOREIGN KEY ("contaOrigemId") REFERENCES "conta_bancaria"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" ADD CONSTRAINT "FK_85eda18ae6566964a39889231c2" FOREIGN KEY ("contaDestinoId") REFERENCES "conta_bancaria"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" ADD CONSTRAINT "FK_d7e43d38dfb4b2cd4c9fe83976b" FOREIGN KEY ("liquidacaoId") REFERENCES "liquidacoes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" ADD CONSTRAINT "FK_d8018977a09b3edf3f797588a49" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" ADD CONSTRAINT "FK_e3c9fadd5b87322037ce3957446" FOREIGN KEY ("planoDeContaId") REFERENCES "plano_de_conta"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" ADD CONSTRAINT "FK_b789b3373454300014271e74db1" FOREIGN KEY ("centroDeCustoId") REFERENCES "centro_de_custo"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" ADD CONSTRAINT "FK_dabe05ac652fa8e3e8c6596f0a6" FOREIGN KEY ("formaRecebimentoId") REFERENCES "formas_recebimento"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" ADD CONSTRAINT "FK_8d91180d58b72621a336a96d6f8" FOREIGN KEY ("estornoDeId") REFERENCES "movimentacoes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" ADD CONSTRAINT "FK_f08d757bc4461e70481fffffc9c" FOREIGN KEY ("criadoPorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" DROP CONSTRAINT "FK_f08d757bc4461e70481fffffc9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" DROP CONSTRAINT "FK_8d91180d58b72621a336a96d6f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" DROP CONSTRAINT "FK_dabe05ac652fa8e3e8c6596f0a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" DROP CONSTRAINT "FK_b789b3373454300014271e74db1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" DROP CONSTRAINT "FK_e3c9fadd5b87322037ce3957446"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" DROP CONSTRAINT "FK_d8018977a09b3edf3f797588a49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" DROP CONSTRAINT "FK_d7e43d38dfb4b2cd4c9fe83976b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" DROP CONSTRAINT "FK_85eda18ae6566964a39889231c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacoes" DROP CONSTRAINT "FK_b35ba2e1232d8d13e188025bf9f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "liquidacoes" DROP CONSTRAINT "FK_693f08951cad7685dc777839b22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "liquidacoes" DROP CONSTRAINT "FK_60b053966ed40b8c565002b466b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "liquidacoes" DROP CONSTRAINT "FK_b1fa9a35d4b433eed66d7d3e47a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "liquidacoes" DROP CONSTRAINT "FK_03579b4295258effb62d42afd32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "liquidacoes" DROP CONSTRAINT "FK_4630896a67826e8338e157ec3fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contas" DROP CONSTRAINT "FK_80265f7d93054f592cb35312196"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contas" DROP CONSTRAINT "FK_69eb3fe3936765b019271ea96c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contas" DROP CONSTRAINT "FK_3867268c3ba3293564f9357ee39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contas" DROP CONSTRAINT "FK_2eae824c96ec37f6a3d0ad601ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plano_de_conta" DROP CONSTRAINT "FK_61a03ed80ce32150e997b08bc7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plano_de_conta" DROP CONSTRAINT "FK_33a400dfdb4ae0e5ff9827398d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "formas_recebimento" DROP CONSTRAINT "FK_55dc26cfc75e85147f3bf1e7c95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conta_bancaria" DROP CONSTRAINT "FK_28e65d2a47aabcdd3439c2b71e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" DROP CONSTRAINT "FK_dbaf0b6f3e6105d2ab7aa40b874"`,
    );
    await queryRunner.query(
      `ALTER TABLE "centro_de_custo" DROP CONSTRAINT "FK_239e5f3e8d34207d3be6a7e31cd"`,
    );
    await queryRunner.query(`DROP INDEX "public"."movimento_estorno_unico"`);
    await queryRunner.query(`DROP INDEX "public"."movimento_liquidacao_unico"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e7a7e1682b93eabd968685ad51"`,
    );
    await queryRunner.query(`DROP TABLE "movimentacoes"`);
    await queryRunner.query(`DROP TYPE "public"."movimentacoes_origem_enum"`);
    await queryRunner.query(`DROP TYPE "public"."movimentacoes_tipo_enum"`);
    await queryRunner.query(`DROP INDEX "public"."liquidacao_ativa_unica"`);
    await queryRunner.query(`DROP TABLE "liquidacoes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_37e8a75da66c746f28426ae688"`,
    );
    await queryRunner.query(`DROP TABLE "contas"`);
    await queryRunner.query(`DROP TYPE "public"."contas_situacao_enum"`);
    await queryRunner.query(`DROP TYPE "public"."contas_tipo_enum"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "plano_de_conta"`);
    await queryRunner.query(
      `DROP TYPE "public"."plano_de_conta_natureza_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."plano_de_conta_tipo_enum"`);
    await queryRunner.query(`DROP TABLE "formas_recebimento"`);
    await queryRunner.query(`DROP TABLE "conta_bancaria"`);
    await queryRunner.query(`DROP TYPE "public"."conta_bancaria_tipo_enum"`);
    await queryRunner.query(`DROP TABLE "cliente"`);
    await queryRunner.query(`DROP TABLE "centro_de_custo"`);
  }
}
