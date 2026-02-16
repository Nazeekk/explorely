import Database from '../index';

export interface FindOptions<T> {
  where?: Partial<T>;
  orderBy?: {
    [key in keyof T]?: 'ASC' | 'DESC';
  };
  limit?: number;
  offset?: number;
}

export abstract class BaseRepository<T> {
  protected constructor(
    protected readonly database: Database,
    protected readonly tableName: string,
  ) {}

  async create(data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const placeholders = values.map((_, i) => `$${i + 1}`).join(',');

    const columns = keys.map((key) => `"${key}"`).join(',');

    const sql = `
      INSERT INTO ${this.tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const result = await this.database.query(sql, values);
    return result.rows[0];
  }

  async find(options: FindOptions<T> = {}): Promise<T[]> {
    const { where = {}, orderBy, limit, offset } = options;

    let sql = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    const conditions: string[] = [];

    Object.entries(where).forEach(([key, value]) => {
      if (value !== undefined) {
        params.push(value);
        conditions.push(`"${key}" = $${params.length}`);
      }
    });

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (orderBy) {
      const orderClauses = Object.entries(orderBy).map(
        ([key, direction]) => `"${key}" ${direction}`,
      );
      if (orderClauses.length > 0) {
        sql += ` ORDER BY ${orderClauses.join(', ')}`;
      }
    }

    if (limit) {
      params.push(limit);
      sql += ` LIMIT $${params.length}`;
    }

    if (offset) {
      params.push(offset);
      sql += ` OFFSET $${params.length}`;
    }

    const result = await this.database.query(sql, params);
    return result.rows;
  }

  async findById(id: number, pkName: string = 'id'): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE "${pkName}" = $1`;
    const result = await this.database.query(sql, [id]);
    return result.rows[0] || null;
  }

  async update(id: number, data: Partial<T>, pkName: string = 'id'): Promise<T | null> {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;

    const params = Object.values(data);

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');

    params.push(id);

    const sql = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE "${pkName}" = $${params.length}
      RETURNING *;
    `;

    const result = await this.database.query(sql, params);
    return result.rows[0] || null;
  }

  async delete(id: number, pkName: string = 'id'): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE "${pkName}" = $1`;
    const result = await this.database.query(sql, [id]);
    return (result.rowCount || 0) > 0;
  }
}
