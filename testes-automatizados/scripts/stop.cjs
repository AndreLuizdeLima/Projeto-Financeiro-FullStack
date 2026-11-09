const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const cache = path.resolve(__dirname, '../.cache');
const pidFile = path.join(cache, 'backend.pid');
if (fs.existsSync(pidFile)) {
  try { process.kill(Number(fs.readFileSync(pidFile, 'utf8'))); } catch (error) { if (error.code !== 'ESRCH') throw error; }
  fs.unlinkSync(pidFile);
}
const pgBin = process.env.PG_BIN || 'C:\\Program Files\\PostgreSQL\\18\\bin';
if (fs.existsSync(path.join(cache, 'postgres/PG_VERSION'))) {
  const result = spawnSync(path.join(pgBin, 'pg_ctl.exe'), ['-D', path.join(cache, 'postgres'), '-m', 'fast', '-w', 'stop'], { stdio: 'inherit' });
  process.exitCode = result.status;
}
