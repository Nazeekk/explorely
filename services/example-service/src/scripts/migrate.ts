import { container } from '../container';

async function runMigrations() {
  // eslint-disable-next-line
  console.log('Running migrations...');
  const sql = `
    CREATE TABLE IF NOT EXISTS example (
        example_id SERIAL PRIMARY KEY,
        example_varchar VARCHAR(255) NOT NULL,
        example_text TEXT,
        example_decimal DECIMAL(10, 2) NOT NULL,
        example_integer INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await container.database.query(sql);
  // eslint-disable-next-line
  console.log('Migrations completed!');
  process.exit(0);
}

runMigrations();
