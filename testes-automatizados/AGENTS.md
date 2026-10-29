# Escopo dos testes automatizados

Ao trabalhar nesta suíte ou usar a skill `skills/playwright-tests/SKILL.md`, crie, altere, mova ou exclua arquivos somente dentro de `testes-automatizados/`. O restante do repositório é somente leitura para esta tarefa.

- Mantenha testes, configurações, dependências, lockfiles, caches, artefatos e documentação nesta pasta. Use um pacote de testes independente.
- Não altere frontend, backend, arquivos da raiz ou workflows. Não faça instalações ou execuções que gerem arquivos nesses locais, nem contorne a regra com links simbólicos.
- Use serviços já iniciados se a inicialização gerar arquivos fora desta pasta. Direcione o cache do gerenciador e os navegadores do Playwright a diretórios locais ignorados.
- Se um problema exigir alteração na aplicação, descreva a correção necessária e aguarde autorização explícita para ampliar o escopo.
- Não inclua alterações preexistentes de outros autores. Antes de commitar, confira que todos os caminhos preparados estão dentro de `testes-automatizados/`.

Estas são instruções para o agente; não constituem bloqueio de escrita imposto pelo sistema operacional.
