# Backend financeiro

API autenticada por Bearer token. O criador é sempre extraído do token. O sistema representa uma única empresa; `clienteId` é a contraparte que paga ou recebe.

## Preparação

Instalar as dependências com `npm ci`. Valores monetários usam `big.js` e `NUMERIC(19,2)`. A API recebe e retorna dinheiro como **string decimal**; não envie números JSON. Taxas são percentuais em strings, até seis casas decimais.

Durante o desenvolvimento, as tabelas são criadas e atualizadas pelo TypeORM com `DB_DATABASE_SYNCHRONIZE=true`.

`FINANCEIRO_TIMEZONE` define a data civil usada no vencimento e nos estornos. Padrão: `America/Sao_Paulo`. Datas da API: `YYYY-MM-DD`. Conta vence quando `dataVencimento < hoje`, se aberta. Não há atualização periódica de status.

## Contas

| Método | Rota | Operação |
|---|---|---|
| POST | `/contas` | Criar conta |
| GET | `/contas` | Listar com paginação |
| GET | `/contas/resumo` | Totais agrupados por tipo/situação e valor vencido |
| GET | `/contas/:id` | Detalhes e histórico de liquidações |
| PATCH | `/contas/:id` | Alterar conta aberta |
| DELETE | `/contas/:id` | Excluir conta aberta sem histórico |
| POST | `/contas/:id/cancelar` | Cancelar conta aberta |
| POST | `/contas/:id/liquidar` | Liquidar integralmente e movimentar caixa |
| POST | `/contas/:id/estornar` | Estornar liquidação e reabrir conta |

Criar conta:

```json
{
  "tipo": "PAGAR",
  "descricao": "Compra de material",
  "valorOriginal": "1000.00",
  "dataEmissao": "2026-10-01",
  "dataVencimento": "2026-10-10",
  "clienteId": 1,
  "planoDeContaId": 2,
  "centroDeCustoId": 3,
  "taxaJurosDiaria": "0.1",
  "taxaMulta": "2"
}
```

Centro de custo é opcional e pode ser removido na edição com `null`. O plano deve ser analítico. Referências usadas em novas operações devem estar ativas.

Liquidar:

```json
{
  "dataPagamento": "2026-10-18",
  "contaBancariaId": 1,
  "formaRecebimentoId": 1
}
```

Juros simples: valor original × taxa diária ÷ 100 × dias de atraso. Multa: valor original × taxa ÷ 100, uma vez, somente se atrasada. As taxas são definidas no cadastro da conta; quando omitidas, são salvas como zero. Podem ser editadas enquanto a conta estiver aberta. A liquidação não aceita taxas: utiliza as salvas na conta e registra uma cópia no histórico. A resposta contém `conta`, `liquidacao` (com dias de atraso, juros, multa e valor total calculados) e `movimento`. Cada encargo é arredondado para centavos (meio para cima); o total soma principal e encargos. Datas de pagamento futuras ou anteriores à emissão são rejeitadas. Sem pagamentos parciais ou parcelamento nesta versão.

A conta liquidada não pode ser editada, excluída ou cancelada. Estorne primeiro. Se houver histórico de liquidação, use cancelamento em vez de exclusão física. Histórico não é apagado.

Filtros: `page`, `limit` (até 100), `tipoConta=PAGAR|RECEBER`, `situacao=ABERTA|LIQUIDADA|CANCELADA`, `vencida=true|false`, `clienteId`, `planoDeContaId`, `centroDeCustoId`, `dataInicial`, `dataFinal`. Período se refere ao vencimento.

## Movimentações

| Método | Rota | Operação |
|---|---|---|
| POST | `/movimentacoes` | Criar entrada, saída ou transferência avulsa |
| GET | `/movimentacoes` | Listar histórico |
| GET | `/movimentacoes/:id` | Detalhar, incluindo conta/baixa vinculada |
| POST | `/movimentacoes/:id/estornar` | Estornar movimentação avulsa |
| GET | `/movimentacoes/saldos` | Saldos por conta financeira (compatibilidade) |
| GET | `/movimentacoes/resumo` | Totais por tipo e origem |

Transferência é **um único registro**:

```json
{
  "tipo": "TRANSFERENCIA",
  "descricao": "Depósito do caixa no banco",
  "valor": "500.00",
  "data": "2026-10-18",
  "contaOrigemId": 1,
  "contaDestinoId": 2
}
```

`ENTRADA` exige apenas destino; `SAIDA` exige apenas origem; `TRANSFERENCIA` exige ambas e diferentes. Valor estritamente positivo. Datas futuras não são aceitas. `origem` admite `AVULSA` (padrão) e `SALDO_INICIAL`; saldo inicial pode ser entrada ou saída para representar abertura positiva ou negativa. Campos opcionais: `clienteId`, `planoDeContaId`, `centroDeCustoId`, `formaRecebimentoId`.

Filtros: `page`, `limit`, `tipo`, `origem`, `contaBancariaId`, `clienteId`, `planoDeContaId`, `centroDeCustoId`, `dataInicial`, `dataFinal`. Período se refere à data efetiva.

Movimentações de liquidação apresentam classificação e contraparte pela conta vinculada. Seu estorno deve ser feito em `/contas/:id/estornar`. Estornos geram movimento inverso, inclusive para transferências. Um movimento pode ter somente um estorno; um estorno não pode ser estornado novamente.

Saldos consideram todo o histórico até `dataFinal` (hoje por padrão), inclusive estornos. `dataInicial` não reduz o saldo acumulado; no endpoint de saldos, utilize apenas `contaBancariaId` e `dataFinal`. O resumo separa transferências e saldo inicial por origem/tipo; essas categorias não devem ser somadas como receita/despesa. Não há bloqueio de saldo negativo nesta versão.

Liquidações e estornos usam transações, bloqueio da conta e índices únicos para impedir duplicação por concorrência. A criação de movimentação avulsa não tem chave de idempotência: não repita automaticamente um POST sem verificar seu resultado.

## Consulta de saldos por conta bancária

`GET /conta-bancaria/saldos` consulta os saldos acumulados, com os filtros `contaBancariaId` e `dataFinal`. A resposta mantém o formato `[{ contaBancariaId, nome, saldo }]`. A rota `/movimentacoes/saldos` permanece disponível por compatibilidade.

## Organização dos serviços

`ContasService` gerencia contas a pagar/receber; `LiquidacoesService` executa liquidações e seus estornos; `MovimentacoesService` gerencia movimentações e inversões; `SaldosService` calcula saldos. As validações compartilhadas recebem o `EntityManager` da operação. Liquidação e estorno continuam usando uma única transação para todas as alterações.
