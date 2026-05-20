const db = require('./database');

class User {
  static async register(userData) {
    const { name, idCard, phone, gender, birthDate, workType, workYears, address, emergencyContact, emergencyPhone } = userData;
    
    const existingUser = await this.findByIdCard(idCard);
    
    if (existingUser) {
      const sql = `
        UPDATE users 
        SET name = ?, phone = ?, gender = ?, birth_date = ?, work_type = ?, work_years = ?, address = ?, emergency_contact = ?, emergency_phone = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id_card = ?
      `;
      await db.run(sql, [name, phone, gender, birthDate, workType, workYears, address, emergencyContact, emergencyPhone, idCard]);
      return { id: existingUser.id, isNew: false };
    } else {
      const sql = `
        INSERT INTO users (name, id_card, phone, gender, birth_date, work_type, work_years, address, emergency_contact, emergency_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await db.run(sql, [name, idCard, phone, gender, birthDate, workType, workYears, address, emergencyContact, emergencyPhone]);
      return { id: result.lastID, isNew: true };
    }
  }

  static async findByIdCard(idCard) {
    const sql = 'SELECT * FROM users WHERE id_card = ?';
    return await db.get(sql, [idCard]);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    return await db.get(sql, [id]);
  }

  static async getStatus(idCard) {
    const user = await this.findByIdCard(idCard);
    if (!user) {
      return null;
    }
    return {
      infoCompleted: !!(user.name && user.id_card),
      trainingCompleted: !!user.training_completed,
      examScore: user.exam_score,
      agreementSigned: !!user.agreement_signed
    };
  }

  static async getInfo(idCard) {
    const user = await this.findByIdCard(idCard);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      name: user.name,
      id_card: user.id_card,
      phone: user.phone,
      gender: user.gender,
      birth_date: user.birth_date,
      work_type: user.work_type,
      work_years: user.work_years,
      address: user.address,
      emergency_contact: user.emergency_contact,
      emergency_phone: user.emergency_phone
    };
  }

  static async completeTraining(idCard) {
    const user = await this.findByIdCard(idCard);
    if (!user) {
      throw new Error('用户不存在');
    }

    const sql = `
      UPDATE users 
      SET training_completed = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id_card = ?
    `;
    await db.run(sql, [idCard]);

    const recordSql = `
      INSERT INTO training_records (user_id, training_content)
      VALUES (?, ?)
    `;
    await db.run(recordSql, [user.id, '安全生产培训']);

    return true;
  }

  static async submitExam(idCard, score) {
    const user = await this.findByIdCard(idCard);
    if (!user) {
      throw new Error('用户不存在');
    }

    const sql = `
      UPDATE users 
      SET exam_score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_card = ?
    `;
    await db.run(sql, [score, idCard]);

    const recordSql = `
      INSERT INTO exam_records (user_id, score)
      VALUES (?, ?)
    `;
    await db.run(recordSql, [user.id, score]);

    return true;
  }

  static async signAgreement(idCard) {
    const user = await this.findByIdCard(idCard);
    if (!user) {
      throw new Error('用户不存在');
    }

    const sql = `
      UPDATE users 
      SET agreement_signed = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id_card = ?
    `;
    await db.run(sql, [idCard]);

    const recordSql = `
      INSERT INTO agreement_records (user_id)
      VALUES (?)
    `;
    await db.run(recordSql, [user.id]);

    return true;
  }

  static async getAll() {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    return await db.all(sql);
  }
}

module.exports = User;
