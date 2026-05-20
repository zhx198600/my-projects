const db = require('./database');

class Agreement {
  static async create(userId) {
    const sql = `
      INSERT INTO agreement_records (user_id)
      VALUES (?)
    `;
    const result = await db.run(sql, [userId]);
    return { id: result.lastID };
  }

  static async findById(id) {
    const sql = 'SELECT * FROM agreement_records WHERE id = ?';
    return await db.get(sql, [id]);
  }

  static async findByUserId(userId) {
    const sql = 'SELECT * FROM agreement_records WHERE user_id = ? ORDER BY signed_at DESC';
    return await db.all(sql, [userId]);
  }

  static async getByUserId(userId) {
    return await this.findByUserId(userId);
  }

  static async delete(id) {
    const sql = 'DELETE FROM agreement_records WHERE id = ?';
    const result = await db.run(sql, [id]);
    return result.changes > 0;
  }

  static async getAll() {
    const sql = 'SELECT * FROM agreement_records ORDER BY signed_at DESC';
    return await db.all(sql);
  }
}

module.exports = Agreement;
