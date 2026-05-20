const db = require('./database');

class Exam {
  static async create(userId, score) {
    const sql = `
      INSERT INTO exam_records (user_id, score)
      VALUES (?, ?)
    `;
    const result = await db.run(sql, [userId, score]);
    return { id: result.lastID };
  }

  static async findById(id) {
    const sql = 'SELECT * FROM exam_records WHERE id = ?';
    return await db.get(sql, [id]);
  }

  static async findByUserId(userId) {
    const sql = 'SELECT * FROM exam_records WHERE user_id = ? ORDER BY completed_at DESC';
    return await db.all(sql, [userId]);
  }

  static async getByUserId(userId) {
    return await this.findByUserId(userId);
  }

  static async update(id, score) {
    const sql = `
      UPDATE exam_records 
      SET score = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await db.run(sql, [score, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM exam_records WHERE id = ?';
    const result = await db.run(sql, [id]);
    return result.changes > 0;
  }

  static async getAll() {
    const sql = 'SELECT * FROM exam_records ORDER BY completed_at DESC';
    return await db.all(sql);
  }
}

module.exports = Exam;
