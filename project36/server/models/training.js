const db = require('./database');

class Training {
  static async create(userId, trainingContent) {
    const sql = `
      INSERT INTO training_records (user_id, training_content)
      VALUES (?, ?)
    `;
    const result = await db.run(sql, [userId, trainingContent]);
    return { id: result.lastID };
  }

  static async findById(id) {
    const sql = 'SELECT * FROM training_records WHERE id = ?';
    return await db.get(sql, [id]);
  }

  static async findByUserId(userId) {
    const sql = 'SELECT * FROM training_records WHERE user_id = ? ORDER BY completed_at DESC';
    return await db.all(sql, [userId]);
  }

  static async update(id, trainingContent) {
    const sql = `
      UPDATE training_records 
      SET training_content = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await db.run(sql, [trainingContent, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM training_records WHERE id = ?';
    const result = await db.run(sql, [id]);
    return result.changes > 0;
  }

  static async getAll() {
    const sql = 'SELECT * FROM training_records ORDER BY completed_at DESC';
    return await db.all(sql);
  }
}

module.exports = Training;
