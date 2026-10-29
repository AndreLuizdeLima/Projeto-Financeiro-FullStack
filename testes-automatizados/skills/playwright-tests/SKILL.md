---
name: playwright-tests
description: Cria, adapta e executa testes automatizados de aplicações web com Playwright a partir do código e dos fluxos reais do projeto. Use para adicionar cobertura E2E ou configurar Playwright em um projeto existente.
---

# Testes automatizados com Playwright

Trabalhe no projeto indicado pelo usuário. Esta skill é portátil: descubra comandos, URLs, regras e seletores no projeto atual; não dependa de um repositório, serviço ou plugin específico.

## Limite obrigatório de escrita

Neste repositório, `testes-automatizados/` é o único diretório autorizado para criar, editar, mover ou excluir arquivos. Leia `testes-automatizados/AGENTS.md` antes de agir. O restante do projeto pode ser lido para descobrir contratos, rotas e comportamentos, mas não pode ser alterado.

- Mantenha o pacote Node de testes, `package.json`, lockfile, configuração Playwright, testes, fixtures, mocks, relatórios, dependências e documentação dentro de `testes-automatizados/`. Execute instalações a partir desse pacote independente, sem alterar workspaces ou lockfiles externos.
- Não edite `frontend/`, `backend/`, arquivos da raiz, workflows ou outros diretórios, nem use links simbólicos ou scripts para contornar esse limite. Não execute comandos de instalação, formatação ou correção que escrevam fora da pasta permitida.
- Navegadores e caches devem ser direcionados a subpastas locais ignoradas, usando `PLAYWRIGHT_BROWSERS_PATH`, `npm_config_cache` e variáveis equivalentes do gerenciador escolhido. Não instale dependências do sistema.
- Prefira uma aplicação de testes já iniciada e `baseURL` por ambiente. Só configure `webServer` se o comando tiver sido verificado e não gerar arquivos fora da pasta permitida; caso contrário, documente como o usuário inicia os serviços separadamente.
- Não altere seletores ou regras da aplicação. Quando uma correção externa for necessária, reporte o impedimento e aguarde uma mudança explícita de escopo.
- Antes de entregar, confira `git status` e o diff. Não inclua alterações preexistentes de outras pessoas. Confirme que todos os arquivos adicionados ao commit estão sob `testes-automatizados/`.

## Conhecer o projeto

- Leia as instruções locais, o manifesto de dependências, os scripts, a documentação e os testes existentes. Identifique o gerenciador pelo lockfile e preserve as versões e convenções do projeto.
- Inspecione rotas, componentes, formulários, validações e contratos da API antes de escrever cenários. Se houver navegador disponível, confira os fluxos na aplicação em execução. Não invente páginas, credenciais ou seletores.
- Escolha os fluxos pedidos pelo usuário. Quando o pedido for genérico, priorize os principais caminhos de uso encontrados e falhas relevantes: campos obrigatórios, dados inválidos e erros de autenticação quando aplicáveis. Não adicione cenários sem comportamento verificável no código ou nos requisitos.

## Preparar o Playwright

- Use um pacote independente em `testes-automatizados/`, com `@playwright/test` como dependência de desenvolvimento. Leia configurações existentes para aproveitar convenções, mas não as edite fora dessa pasta. Preserve a stack da aplicação.
- Adapte `playwright.config.ts` ou seu equivalente à linguagem do projeto. Use `baseURL` configurável por variável de ambiente e, quando respeitar o limite de escrita, `webServer` com o comando real de inicialização. Só reutilize um servidor existente fora de CI.
- Comece com Chromium, salvo exigência diferente. Configure trace na primeira repetição e captura de tela em falhas. Preserve a política existente de retries; ao criar configuração nova, use zero localmente e no máximo duas repetições em CI.
- Acrescente scripts para executar, abrir a interface e visualizar o relatório se ainda não existirem. Ignore relatórios, resultados, traces, arquivos de autenticação e segredos no Git. Nunca sobrescreva configurações ou scripts sem preservar o que já é usado.

## Escrever os testes

- Use `test` e `expect` de `@playwright/test`, com cenários e títulos que descrevam resultados observáveis. Prefira `getByRole`, `getByLabel` e outros seletores acessíveis; use IDs de teste estáveis quando necessário.
- Use assertions com espera automática. Evite `waitForTimeout`, seletores frágeis e dependência entre testes. Para ações que provocam uma resposta ou navegação, registre a espera antes da ação quando necessário.
- Valide o efeito da ação: mudança na interface, persistência após recarregar, mensagem de validação ou resposta pertinente. Um clique sem uma verificação do resultado não constitui cobertura suficiente.
- Crie dados isolados por teste e remova somente os dados criados pela suíte, inclusive em caso de falha. Utilize ambiente local ou de testes; não realize cadastros, pagamentos ou exclusões em produção sem autorização específica.
- Para login, use contas de teste configuradas por ambiente. Se for necessário reutilizar sessão, gere storage state durante o setup e mantenha o arquivo fora do Git. Evite repetir o login em cada teste quando isso não for o comportamento sob teste.
- Nos testes de integração E2E, use o backend de testes real quando disponível. Quando o backend estiver indisponível e mocks forem apropriados, derive as respostas do contrato existente e identifique claramente a cobertura como interface com API simulada. Não afirme que mocks validam persistência ou integração real.
- Use helpers ou page objects apenas quando reduzirem repetição concreta. Não gere uma arquitetura inteira para poucos testes e não altere regras da aplicação para fazer um teste passar.

## Executar e entregar

- Instale o navegador necessário se estiver ausente. Execute a descoberta da suíte e depois os testes relevantes com os comandos do gerenciador adotado.
- Investigue as falhas: corrija testes incorretos; reporte defeitos reais da aplicação sem enfraquecer assertions ou esconder cenários com `skip`. Reexecute após correções pertinentes.
- Se faltarem rede, dependências, navegador, servidor ou credenciais, declare exatamente o bloqueio e os comandos pendentes. Distingua testes escritos, descobertos e efetivamente executados; não declare aprovação sem execução.
- Entregue os arquivos de configuração e teste, os scripts necessários e uma orientação curta de execução na documentação de `testes-automatizados/`. Informe cenários cobertos, resultado observado e variáveis obrigatórias sem revelar segredos. Publicação e push dependem do pedido do usuário.
