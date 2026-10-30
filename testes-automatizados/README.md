# Skill de testes com Playwright

A skill está em `skills/playwright-tests/SKILL.md`. Este diretório contém apenas as instruções reutilizáveis; os testes e o pacote Playwright serão gerados ao invocá-la.

No agente com acesso ao repositório, use:

> Leia testes-automatizados/AGENTS.md e aplique a skill testes-automatizados/skills/playwright-tests/SKILL.md. Analise o projeto e crie testes Playwright dos fluxos existentes de autenticação. Crie e altere arquivos somente em testes-automatizados/; o restante do projeto é somente leitura. Execute os testes se os serviços e dependências estiverem disponíveis e informe os resultados reais.

A skill foi mantida nesta pasta para respeitar o limite de alterações. A descoberta automática depende do agente; o caminho explícito acima permite carregá-la sem instalar arquivos em outros diretórios.

A futura suíte terá pacote, dependências, configuração e documentação próprios dentro desta pasta. Para integração real, frontend, backend e banco de testes precisam estar disponíveis. Não use dados de produção. Não declare aprovação de testes que não foram executados.

A regra é uma instrução ao agente; isolamento obrigatório no sistema exige configurar permissões adicionais no ambiente de execução.
