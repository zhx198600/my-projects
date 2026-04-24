import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { Session, Message, CreateSessionRequest, CreateMessageRequest } from '../types';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  try {
    const { username } = req.body as CreateSessionRequest;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }
    
    const id = crypto.randomUUID();
    const result = db.run(
      'INSERT INTO session (id, username) VALUES (?, ?)',
      [id, username]
    );
    
    if (!result.changes) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create session'
      });
    }
    
    const session = db.get<Session>('SELECT * FROM session WHERE id = ?', [id]);
    
    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session'
    });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    
    let sessions: Session[];
    
    if (status && status.trim()) {
      sessions = db.all<Session>(
        'SELECT * FROM session WHERE status = ? ORDER BY created_at DESC',
        [status]
      );
    } else {
      sessions = db.all<Session>('SELECT * FROM session ORDER BY created_at DESC');
    }
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions'
    });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    const session = db.get<Session>('SELECT * FROM session WHERE id = ?', [id]);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session'
    });
  }
});

router.get('/:id/messages', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    const session = db.get<Session>('SELECT * FROM session WHERE id = ?', [id]);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    const messages = db.all<Message>(
      'SELECT * FROM conversation WHERE session_id = ? ORDER BY timestamp ASC',
      [id]
    );
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

router.post('/:id/messages', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { message, sender } = req.body as CreateMessageRequest;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    if (sender !== 'user' && sender !== 'bot') {
      return res.status(400).json({
        success: false,
        message: 'Sender must be either "user" or "bot"'
      });
    }
    
    const session = db.get<Session>('SELECT * FROM session WHERE id = ?', [id]);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    const result = db.run(
      'INSERT INTO conversation (session_id, message, sender) VALUES (?, ?, ?)',
      [id, message, sender]
    );
    
    if (!result.changes) {
      return res.status(500).json({
        success: false,
        message: 'Failed to add message'
      });
    }
    
    const messageId = result.lastInsertRowid as number;
    const newMessage = db.get<Message>('SELECT * FROM conversation WHERE id = ?', [messageId]);
    
    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message'
    });
  }
});

export default router;