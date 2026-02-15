import db from '../database/connection';

// Helper para queries comuns
export const dbHelpers = {
  // Buscar um registro por ID
  findById: async (table: string, id: string) => {
    return await db.oneOrNone(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  },

  // Buscar todos os registros
  findAll: async (table: string, where?: string, params?: any[]) => {
    const query = where 
      ? `SELECT * FROM ${table} WHERE ${where}`
      : `SELECT * FROM ${table}`;
    return await db.any(query, params || []);
  },

  // Criar registro
  create: async (table: string, data: Record<string, any>) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');
    
    const query = `
      INSERT INTO ${table} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    return await db.one(query, values);
  },

  // Atualizar registro
  update: async (table: string, id: string, data: Record<string, any>) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    
    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
    
    return await db.one(query, [id, ...values]);
  },

  // Deletar registro
  delete: async (table: string, id: string) => {
    return await db.none(`DELETE FROM ${table} WHERE id = $1`, [id]);
  },

  // Contar registros
  count: async (table: string, where?: string, params?: any[]) => {
    const query = where
      ? `SELECT COUNT(*) FROM ${table} WHERE ${where}`
      : `SELECT COUNT(*) FROM ${table}`;
    const result = await db.one(query, params || []);
    return parseInt(result.count);
  },
};

export default db;

