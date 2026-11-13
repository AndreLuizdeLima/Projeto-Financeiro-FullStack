// Runs the unchanged application with all generated files inside this test package.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const cache = path.join(root, '.cache');
fs.mkdirSync(cache, { recursive: true });
const pgBin = process.env.PG_BIN || 'C:\\Program Files\\PostgreSQL\\18\\bin';
const pgData = path.join(cache, 'postgres');
const pgPort = 55432;
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})`);
}
async function main() {
  if (!fs.existsSync(path.join(pgBin, 'initdb.exe'))) throw new Error('Set PG_BIN to a PostgreSQL bin directory.');
  if (!fs.existsSync(path.join(pgData, 'PG_VERSION'))) {
    run(path.join(pgBin, 'initdb.exe'), ['-D', pgData, '-U', 'fluxo_test', '-A', 'trust', '--encoding=UTF8', '--locale=C']);
  }
  if (spawnSync(path.join(pgBin, 'pg_ctl.exe'), ['-D', pgData, 'status'], { stdio: 'ignore' }).status !== 0) {
    run(path.join(pgBin, 'pg_ctl.exe'), ['-D', pgData, '-l', path.join(cache, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${pgPort}`, '-w', 'start']);
  }
  const configPath = path.join(cache, 'tsconfig.backend.json');
  const outDir = path.join(cache, 'backend');
  fs.writeFileSync(configPath, JSON.stringify({
    extends: '../../backend/tsconfig.build.json',
    compilerOptions: { outDir: './backend', declaration: false, sourceMap: false,
      baseUrl: '../../backend', ignoreDeprecations: '6.0',
      paths: { '@/*': ['src/*'], '*': ['../testes-automatizados/node_modules/*'] },
      typeRoots: [path.join(root, 'node_modules/@types')],
    },
  }, null, 2));
  run(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', configPath]);
  await require('tsc-alias').replaceTscAliasPaths({ configFile: configPath });
  const { Client } = require('pg');
  const admin = new Client({ host: '127.0.0.1', port: pgPort, user: 'fluxo_test', database: 'postgres' });
  await admin.connect();
  if (!(await admin.query("SELECT 1 FROM pg_database WHERE datname = 'fluxo_e2e'")).rowCount) await admin.query('CREATE DATABASE fluxo_e2e');
  await admin.end();
  const env = { ...process.env, PORT: '4300', FRONTEND_ORIGIN: 'http://127.0.0.1:4173',
    DB_DATABASE_HOST: '127.0.0.1', DB_DATABASE_PORT: String(pgPort), DB_DATABASE_USERNAME: 'fluxo_test',
    DB_DATABASE_PASSWORD: '', DB_DATABASE_DATABASE: 'fluxo_e2e', DB_DATABASE_AUTO_LOAD_ENTITIES: 'true', DB_DATABASE_SYNCHRONIZE: 'true',
    JWT_SECRET: crypto.randomBytes(48).toString('hex'), JWT_TOKEN_AUDIENCE: 'fluxo-e2e', JWT_TOKEN_ISSUER: 'fluxo-e2e',
    JWT_ACCESS_TOKEN_TTL: '1800', JWT_REFRESH_TOKEN_TTL: '14400', FINANCEIRO_TIMEZONE: 'America/Sao_Paulo',
  };
  const log = fs.openSync(path.join(cache, 'backend.log'), 'a');
  const child = spawn(process.execPath, [path.join(outDir, 'main.js')], { cwd: root, env, stdio: ['ignore', log, log], windowsHide: true });
  fs.writeFileSync(path.join(cache, 'backend.pid'), String(child.pid));
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error('Backend exited. Inspect .cache/backend.log');
    try { if ((await fetch('http://127.0.0.1:4300')).ok) break; } catch {}
    if (attempt === 59) throw new Error('Backend did not become ready. Inspect .cache/backend.log');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  const db = new Client({ host: '127.0.0.1', port: pgPort, user: 'fluxo_test', database: 'fluxo_e2e' });
  await db.connect();
  const email = 'automacao@fluxo.test';
  const password = crypto.randomBytes(18).toString('base64url');
  const hash = await require('bcryptjs').hash(password, 10);
  const seeded = await db.query('INSERT INTO "user" (nome, email, "passwordHash", "isActive") VALUES ($1,$2,$3,true) ON CONFLICT (email) DO UPDATE SET "passwordHash"=$3, "isActive"=true RETURNING id', ['Automação E2E', email, hash]);
  // The API only creates children; provide the required synthetic root as test data.
  await db.query('INSERT INTO plano_de_conta (codigo,nome,tipo,natureza,"isActive","criadoPorId") VALUES (\'4\',\'Despesas E2E\',\'DESPESA\',\'SINTETICA\',true,$1) ON CONFLICT (codigo) DO NOTHING', [seeded.rows[0].id]);
  await db.end();
  fs.writeFileSync(path.join(cache, 'credentials.json'), JSON.stringify({ email, password }));
  console.log('Real backend ready: http://127.0.0.1:4300; isolated PostgreSQL: 127.0.0.1:55432/fluxo_e2e');
  console.log('Run npm test in another terminal. Stop with npm run env:stop.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
