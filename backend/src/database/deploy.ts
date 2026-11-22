import database from './data-source';

async function implantar() {
  try {
    await database.initialize();
    const executadas = await database.runMigrations({ transaction: 'all' });
    console.log(
      `Implantação concluída: ${executadas.length} migration(s) executada(s).`,
    );
  } catch {
    // Não imprime queries ou parâmetros que possam incluir credenciais de implantação.
    console.error(
      'Falha na implantação. Confira a conexão e as variáveis SEED_ADMIN_NOME, SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD. Use um banco vazio no primeiro deploy.',
    );
    process.exitCode = 1;
  } finally {
    if (database.isInitialized) await database.destroy();
  }
}
void implantar();
