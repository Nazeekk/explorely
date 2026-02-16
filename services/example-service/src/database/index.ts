import { Pool, PoolConfig } from 'pg';

export default class Database {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  async query(query: string, params?: any[]): Promise<any> {
    return this.pool.query(query, params);
  }

  async close() {
    await this.pool.end();
  }
}
