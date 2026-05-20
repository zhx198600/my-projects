const db = require('./database');

class IdCardPhoto {
  static async create(userId, frontImage, backImage) {
    const existing = await this.findByUserId(userId);
    
    if (existing) {
      const sql = `
        UPDATE id_card_photos 
        SET front_image = ?, back_image = ?
        WHERE user_id = ?
      `;
      await db.run(sql, [frontImage, backImage, userId]);
      return { id: existing.id, isNew: false };
    } else {
      const sql = `
        INSERT INTO id_card_photos (user_id, front_image, back_image)
        VALUES (?, ?, ?)
      `;
      const result = await db.run(sql, [userId, frontImage, backImage]);
      return { id: result.lastID, isNew: true };
    }
  }

  static async findById(id) {
    const sql = 'SELECT * FROM id_card_photos WHERE id = ?';
    return await db.get(sql, [id]);
  }

  static async findByUserId(userId) {
    const sql = 'SELECT * FROM id_card_photos WHERE user_id = ?';
    return await db.get(sql, [userId]);
  }

  static async update(id, frontImage, backImage) {
    const sql = `
      UPDATE id_card_photos 
      SET front_image = ?, back_image = ?
      WHERE id = ?
    `;
    const result = await db.run(sql, [frontImage, backImage, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM id_card_photos WHERE id = ?';
    const result = await db.run(sql, [id]);
    return result.changes > 0;
  }

  static async getAll() {
    const sql = 'SELECT * FROM id_card_photos ORDER BY created_at DESC';
    return await db.all(sql);
  }
}

module.exports = IdCardPhoto;
