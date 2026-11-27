# Implantação com Docker Compose

Execute os comandos na raiz do projeto. Requer Docker Engine com Compose v2 e Nginx no servidor.

## 1. Configurar

```sh
cp .env.deploy.example .env.deploy
```

Preencha `.env.deploy`:

- `POSTGRES_PASSWORD`: senha exclusiva para este PostgreSQL.
- `SEED_ADMIN_NOME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`: primeiro usuário. Senha com pelo menos 12 caracteres e no máximo 72 bytes (limite do bcrypt).
- `JWT_SECRET`: segredo aleatório; pode gerar com `openssl rand -hex 32`.
- `FRONTEND_ORIGIN`: domínio público com protocolo, sem barra final.
- `FRONTEND_PORT` e `BACKEND_PORT`: portas locais disponíveis; padrões 8080 e 3000.

Os nomes audience/issuer do JWT devem permanecer iguais entre reinicializações. Não coloque segredos em variáveis `VITE_`.

## 2. Subir

```sh
docker compose --env-file .env.deploy up -d --build
docker compose --env-file .env.deploy ps -a
docker compose --env-file .env.deploy logs migration
```

O Compose executa nesta ordem:

1. `db`: PostgreSQL 17 exclusivo desta aplicação. Na primeira execução, a imagem oficial cria o usuário e o banco definidos em `POSTGRES_USER`/`POSTGRES_DB`.
2. `migration`: cria tabelas, enums, índices e chaves estrangeiras; depois insere dados iniciais. Ambas as migrations executam em uma transação. Falha nos seeds reverte também o esquema.
3. `backend`: só inicia após sucesso da migration, com `synchronize=false`.
4. `frontend`: build estático servido por Nginx, só inicia após o backend saudável.

O serviço `migration` terminar com `Exited (0)` é esperado. O histórico em `implantacao_migrations` impede repetir os seeds nas próximas execuções. Alterar as variáveis de seed depois não altera o usuário existente nem redefine sua senha.

Dados iniciais:

- Um usuário com as credenciais fornecidas; não existe perfil administrativo separado no sistema atual.
- Quatro contas sintéticas: Ativo (1), Passivo (2), Receitas (3), Despesas (4).
- Duas analíticas: Receitas gerais (3.1) e Despesas gerais (4.1).
- Centro de custo Geral.
- Formas Pix, Dinheiro e Transferência bancária.

Não são criados clientes, contas bancárias, títulos ou movimentações fictícias.

A implantação inicial é para banco vazio. Não aponte para o banco de desenvolvimento já preenchido: esta migration não faz adoção automática de um esquema existente.

## 3. Dados persistentes na raiz

```text
./docker-data/postgres/  # dados do PostgreSQL, bind mount
./.env.deploy           # configuração privada
./backups/              # backups manuais
```

As pastas e o arquivo estão ignorados pelo Git. O Docker cria a pasta do banco; não é necessário alterar permissões manualmente em condições normais. O banco não publica porta no host. Sua rede é a rede privada deste projeto Compose; não usa PostgreSQL externo nem de outra aplicação.

Mantenha o projeto no mesmo caminho: mover a pasta sem mover `docker-data/postgres` resultará em um novo banco vazio. As variáveis `POSTGRES_*` inicializam somente um diretório vazio; trocar a senha no arquivo não altera uma instância já inicializada. Não remova a pasta para atualizar os containers. O bind mount é persistência, não um backup.

## 4. Nginx do servidor

Use `deploy/nginx-host.conf.example` como base de um site dedicado, ajustando o domínio e as duas portas. Preserve as configurações dos outros sites do servidor.

- `/` → `127.0.0.1:8080` (frontend).
- `/api/` → `127.0.0.1:3000/` (backend, removendo `/api/`).

Antes de recarregar:

```sh
sudo nginx -t
sudo systemctl reload nginx
```

O exemplo inicia em HTTP. Configure depois o certificado HTTPS para o domínio no Nginx do servidor, incluindo redirecionamento de HTTP para HTTPS. Se fizer uma validação inicial somente em HTTP, ajuste temporariamente `FRONTEND_ORIGIN` para esse protocolo.

O frontend usa `VITE_API_URL=/api` no build. Acessar diretamente a porta 8080 permite verificar arquivos e rotas, mas login e demais chamadas dependem do Nginx do servidor encaminhar `/api/`. O nome interno `backend` nunca é usado como URL no navegador.

Verificações após configurar o proxy:

```sh
curl --fail http://127.0.0.1:3000/health
curl --fail https://financeiro.seudominio.com.br/api/health
curl --fail -I https://financeiro.seudominio.com.br/movimentacoes
```

Depois valide login com o usuário inicial e consulte plano de contas, centros e formas. O endpoint `/health` verifica também a conexão com PostgreSQL, sem retornar dados internos.

## 5. Atualizar e parar

Antes de atualização, faça backup:

```sh
mkdir -p backups
docker compose --env-file .env.deploy exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "backups/financeiro-$(date +%Y%m%d-%H%M%S).dump"
```

Guarde também uma cópia fora do servidor. Em uma atualização manual:

```sh
docker compose --env-file .env.deploy build
docker compose --env-file .env.deploy stop frontend backend
docker compose --env-file .env.deploy up -d db
docker compose --env-file .env.deploy run --rm migration
docker compose --env-file .env.deploy up -d backend frontend
```

Execute cada comando somente se o anterior terminar com sucesso. O procedimento admite uma breve indisponibilidade. Não inicie a nova aplicação se a migration falhar. Mudanças futuras nas entidades precisam de novas migrations; não edite a migration inicial depois de aplicada. Não existe rollback automático de dados; a migration de seeds não permite exclusão automática.

Para parar os serviços preservando os arquivos do banco:

```sh
docker compose --env-file .env.deploy down
```

Nunca apague `docker-data/postgres` durante uma atualização. Para restauração, utilize primeiro um banco isolado e valide o backup antes de substituir dados existentes.
