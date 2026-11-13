# Testes automatizados do Fluxo

Pacote independente com Playwright/Chromium. Os testes usam o frontend React, o backend NestJS e PostgreSQL reais. Não há respostas de API simuladas nesta suíte.

Resultado de 09/11/2026: **61 passaram e 4 falharam**, de 65 executados. As falhas detectam exposição de `criadoPor.passwordHash` em quatro endpoints de criação. Veja [RESULTADOS.md](RESULTADOS.md) para reprodução e diagnóstico.

## Executar no Windows

Ambiente validado: Node.js 25.1.0, npm 11.6.2 e binários do PostgreSQL 18.3. Não é necessário instalar dependências no frontend ou backend. Execute os comandos a partir desta pasta:

```powershell
$env:npm_config_cache = Join-Path (Get-Location) '.npm'
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.playwright'
# Ajuste se o PostgreSQL estiver instalado em outro local:
$env:PG_BIN = 'C:\Program Files\PostgreSQL\18\bin'
npm ci --no-audit --no-fund
node node_modules/playwright/cli.js install chromium
npm run env:start
```

Mantenha esse terminal aberto. Em outro terminal, nesta mesma pasta:

```powershell
npm run test:list
npm test
npm run report
# Ao terminar (use o mesmo PG_BIN caso tenha personalizado):
npm run env:stop
```

Também há `npm run test:ui`. Para executar apenas um arquivo, use `npm test -- tests/auth.spec.ts`.

## Ambiente e dados

- PostgreSQL separado em `.cache/postgres`, escutando somente em `127.0.0.1:55432`; banco `fluxo_e2e`. O serviço PostgreSQL já instalado e seus bancos não são usados nem modificados.
- O código do backend é compilado para `.cache/backend`; a API escuta em `http://127.0.0.1:4300`.
- O Vite lê os arquivos originais do frontend e usa dependências, configuração e cache deste pacote. O Playwright inicia e encerra esse servidor em `http://127.0.0.1:4173`.
- `BASE_URL` permite indicar outro endereço do frontend conectado ao mesmo backend isolado. A suíte recusa um `API_URL` diferente de `http://127.0.0.1:4300`, pois cria e remove dados de teste.
- `env:start` cria uma conta exclusiva e uma raiz sintética de plano de contas, necessária para a API criar filhos. A senha é aleatória e fica em `.cache/credentials.json`, ignorado pelo Git. O login é feito de verdade; `TEST_EMAIL` e `TEST_PASSWORD` podem substituir essa conta apenas no ambiente isolado.
- Cada teste tem dados próprios. A limpeza remove por ID somente registros criados pelo teste, inclusive quando uma assertion falha. A conta e a raiz de preparação permanecem no banco isolado para reexecução.
- Encerre o ambiente com `env:stop` antes de iniciar novamente. Portas 4173, 4300 e 55432 precisam estar disponíveis.
- Arquivos novos, dependências, lockfile, caches, navegador, banco, logs e relatórios permanecem em `testes-automatizados/`, conforme [AGENTS.md](AGENTS.md). Frontend e backend não são editados.

## Cobertura

| Arquivo | Cenários |
| --- | --- |
| `auth.spec.ts` | Login válido/inválido, campos obrigatórios, restauração e encerramento de sessão, armazenamento corrompido, usuário inativo, tipo de token e proteção das seis rotas. |
| `cadastros.spec.ts` | Clientes, centros de custo, formas de recebimento, contas bancárias e usuários: criação, consulta somente leitura, edição, cancelamento, inativação, reativação quando prevista, persistência após reload, validações, e-mail duplicado e paginação real. |
| `dashboard-navigation.spec.ts` | Menu desktop/móvel, totais de movimentações reais no dashboard, gráfico, mês futuro/inválido, rota desconhecida, proteção das APIs e proibição de inativar o próprio usuário. |
| `financeiro.spec.ts` | Entradas, saídas, transferência, saldos, estornos, contas a pagar/receber, liquidação, bloqueios de duplicidade/edição/histórico, cancelamento, referências inativas e plano de contas. Recursos sem tela são exercitados pela API real. |
| `security.spec.ts` | Respostas de criação de cadastros não devem expor `criadoPor.passwordHash`. As assertions mostram somente a presença do campo, sem imprimir o hash. |

Os 65 cenários não representam cobertura completa de todas as combinações. Parcelamentos, pagamentos parciais e outros recursos ainda não implementados não são inventados pelos testes.

Relatório navegável: `playwright-report/index.html`; resultado estruturado: `test-results/results.json`. Capturas de tela são geradas nas falhas de navegador e traces na primeira repetição. Localmente não há repetição automática; em CI há no máximo duas.

Os testes unitários existentes do backend são independentes desta suíte. Não execute instalações nem gere seus artefatos fora desta pasta ao trabalhar sob o escopo do AGENTS.md.

## Skill reutilizável

A skill original permanece em [skills/playwright-tests/SKILL.md](skills/playwright-tests/SKILL.md). Para expandir a suíte, leia primeiro `AGENTS.md`, descubra o comportamento no código atual e mantenha todas as alterações nesta pasta.
