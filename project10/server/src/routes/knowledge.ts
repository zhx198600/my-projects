import { Router, Request, Response } from 'express';
import { db } from '../db';
import { Knowledge, CreateKnowledgeRequest, UpdateKnowledgeRequest } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    
    let knowledgeList: Knowledge[];
    
    if (search && search.trim()) {
      const searchTerm = `%${search}%`;
      knowledgeList = db.all<Knowledge>(
        `SELECT * FROM knowledge WHERE question LIKE ? OR keywords LIKE ? OR answer LIKE ?`,
        [searchTerm, searchTerm, searchTerm]
      );
    } else {
      knowledgeList = db.all<Knowledge>('SELECT * FROM knowledge');
    }
    
    res.json({
      success: true,
      data: knowledgeList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch knowledge list'
    });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    const knowledge = db.get<Knowledge>('SELECT * FROM knowledge WHERE id = ?', [id]);
    
    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge not found'
      });
    }
    
    res.json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch knowledge'
    });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { question, keywords, answer } = req.body as CreateKnowledgeRequest;
    
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }
    
    const result = db.run(
      'INSERT INTO knowledge (question, keywords, answer) VALUES (?, ?, ?)',
      [question, keywords || '', answer]
    );
    
    const id = result.lastInsertRowid as number;
    const knowledge = db.get<Knowledge>('SELECT * FROM knowledge WHERE id = ?', [id]);
    
    res.status(201).json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create knowledge'
    });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    const existing = db.get<Knowledge>('SELECT * FROM knowledge WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge not found'
      });
    }
    
    const { question, keywords, answer } = req.body as UpdateKnowledgeRequest;
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (question !== undefined) {
      fields.push('question = ?');
      values.push(question);
    }
    if (keywords !== undefined) {
      fields.push('keywords = ?');
      values.push(keywords);
    }
    if (answer !== undefined) {
      fields.push('answer = ?');
      values.push(answer);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    db.run(
      `UPDATE knowledge SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    const updated = db.get<Knowledge>('SELECT * FROM knowledge WHERE id = ?', [id]);
    
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update knowledge'
    });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    const existing = db.get<Knowledge>('SELECT * FROM knowledge WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge not found'
      });
    }
    
    db.run('DELETE FROM knowledge WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Knowledge deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete knowledge'
    });
  }
});

export default router;
