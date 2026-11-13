# Resultado da execução

Aplicação: `AndreLuizdeLima/Projeto-Financeiro-FullStack`, commit `7a17d87418416e5c9552dd698d9863516246674e`.
Data: 09/11/2026. Comando: `npm test`, dentro de `testes-automatizados/`.
Ambiente: Windows, Node 25.1.0, Playwright 1.65.0, Chromium e PostgreSQL 18.3.
Última execução completa: início às 18:49:01 (America/Sao_Paulo), duração de 104,1 segundos, sem testes instáveis ou ignorados.

O frontend original foi servido pelo Vite com React, React Compiler/Babel e Tailwind. O backend original foi compilado para a pasta de cache da suíte e conectado a um cluster PostgreSQL exclusivo de testes. Não foram usados mocks de API.

| Grupo | Executados | Passaram | Falharam |
| --- | ---: | ---: | ---: |
| Autenticação e proteção de rotas | 16 | 16 | 0 |
| Cadastros e validações | 18 | 18 | 0 |
| Dashboard, navegação e proteção de APIs | 20 | 20 | 0 |
| Integração financeira por API | 7 | 7 | 0 |
| Exposição de dados sensíveis | 4 | 0 | 4 |
| **Total** | **65** | **61** | **4** |

Nenhum teste foi ignorado. As falhas de segurança continuam como testes normais, sem `skip`, `fixme` ou classificação de falha esperada. Por isso, `npm test` retorna código 1 enquanto o defeito existir.

## Defeito confirmado: hash de senha na resposta de criação

Os quatro endpoints abaixo retornam `criadoPor.passwordHash` no corpo JSON de uma criação bem-sucedida:

- `POST /cliente`
- `POST /centro-de-custo`
- `POST /formas-recebimento`
- `POST /conta-bancaria`

É um mesmo defeito de exposição de dado sensível reproduzido em quatro recursos. O campo contém um hash, não a senha em texto puro. Nenhum valor de hash ou credencial foi copiado para este documento ou para as assertions dos testes.

Para reproduzir no ambiente isolado:

```powershell
npm test -- tests/security.spec.ts
```

O teste autentica na API real, cria um registro válido, verifica a presença do campo proibido e remove o registro no teardown. Resultado esperado: campo ausente. Resultado observado: campo presente nos quatro endpoints.

O código dos serviços carrega a entidade completa do usuário com `findOneBy`, atribui essa entidade a `criadoPor` e devolve diretamente o resultado do `save`. Referências no código original:

- [ClienteService](../backend/src/cliente/cliente.service.ts), linhas 25–39.
- [CentroDeCustoService](../backend/src/centro-de-custo/centro-de-custo.service.ts), linhas 28–42.
- [FormasRecebimentoService](../backend/src/formas-recebimento/formas-recebimento.service.ts), linhas 28–42.
- [ContaBancariaService](../backend/src/conta-bancaria/conta-bancaria.service.ts), linhas 28–42.

Correção indicada: buscar somente o ID do criador nesses fluxos ou projetar a resposta em um DTO público sem dados de senha. Preserve a leitura interna do hash necessária à autenticação. A correção exige alterar o backend, fora do escopo de escrita desta suíte, e não foi aplicada.

## Artefatos e limpeza

- [Relatório HTML](playwright-report/index.html), com os 65 resultados.
- [JSON do Playwright](test-results/results.json), com contagens, tempos e falhas.
- [Instruções de reexecução](README.md).

Os testes removem por ID os dados que criaram, mesmo nas falhas. A conferência do banco após a última execução confirmou zero clientes, centros de custo, formas de recebimento, contas bancárias, contas, liquidações e movimentações; somente o usuário e a raiz de plano de contas da preparação permaneceram. O backend e o cluster PostgreSQL de testes foram encerrados após a conferência.

Os 202 testes unitários do backend executados anteriormente não fazem parte das contagens acima. A suíte atual verifica fluxos reais de navegador e integração HTTP/banco; não é uma certificação de todos os recursos ou casos possíveis do sistema.
