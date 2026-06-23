(async () => {
  const { default: postgres } =
    await import('postgres');

  const sql =
    postgres(
      'postgresql://postgres:postgres@localhost:5432/postgres'
    );

  try {
    await sql`SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'finance_app' AND pid <> pg_backend_pid()`;
    await sql`DROP DATABASE IF EXISTS finance_app`;
    await sql`CREATE DATABASE finance_app`;
    console.log('Database reset successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
})();
