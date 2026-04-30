import { Request, Response } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import SensitiveWord from '../models/SensitiveWord';
import { sensitiveWordFilter } from '../utils/sensitiveWordFilter';

import { demoPostsStore, demoCommentsStore, flattenComments } from './postController';

const escapeCsv = (str: string) => {
  if (!str) return '';
  const s = String(str).replace(/"/g, '""');
  return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
};

let sensitiveWordsStore: any[] = [
  { _id: 's1', word: '暴力', createdAt: new Date().toISOString() },
  { _id: 's2', word: '色情', createdAt: new Date().toISOString() },
  { _id: 's3', word: '赌博', createdAt: new Date().toISOString() },
];

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    try {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: '帖子不存在' });
      }
      await Comment.deleteMany({ postId: post._id });
      await Post.findByIdAndDelete(id);
    } catch (dbError) {
      console.warn('内存数据：删除帖子', id);
      const index = demoPostsStore.findIndex((p) => p._id === id);
      if (index > -1) {
        demoPostsStore.splice(index, 1);
      }
      return res.json({ message: '帖子删除成功' });
    }

    res.json({ message: '帖子删除成功' });
  } catch (error: any) {
    res.status(500).json({ message: '删除帖子失败', error: error.message });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    try {
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({ message: '评论不存在' });
      }
      const CommentModel = Comment as any;
      await CommentModel.deleteCommentAndReplies(id);
    } catch (dbError) {
      console.warn('内存数据：删除评论', id);
      const cid = String(id);
      const removeById = (comments: any[]): any[] => {
        return comments.filter((c: any) => {
          if (c._id === cid) return false;
          if (c.children && c.children.length > 0) {
            c.children = removeById(c.children);
          }
          return true;
        });
      };
      const newComments = removeById(demoCommentsStore);
      demoCommentsStore.length = 0;
      demoCommentsStore.push(...newComments);
      return res.json({ message: '评论删除成功' });
    }

    res.json({ message: '评论删除成功' });
  } catch (error: any) {
    res.status(500).json({ message: '删除评论失败', error: error.message });
  }
};

export const toggleCommentsStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { commentsEnabled } = req.body;

    if (typeof commentsEnabled !== 'boolean') {
      return res.status(400).json({ message: 'commentsEnabled 必须是布尔值' });
    }

    try {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: '帖子不存在' });
      }
      post.commentsEnabled = commentsEnabled;
      await post.save();
    } catch (dbError) {
      console.warn('内存数据：设置评论状态', id, commentsEnabled);
      const post = demoPostsStore.find((p) => p._id === id);
      if (post) {
        post.commentsEnabled = commentsEnabled;
      }
      return res.json({
        message: commentsEnabled ? '已开启评论' : '已关闭评论',
        post: {
          _id: id,
          commentsEnabled: commentsEnabled,
        },
      });
    }

    res.json({
      message: commentsEnabled ? '已开启评论' : '已关闭评论',
      post: {
        _id: id,
        commentsEnabled: commentsEnabled,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: '设置评论状态失败', error: error.message });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    let posts;
    try {
      posts = await Post.find()
        .populate('author', 'username')
        .sort({ createdAt: -1 });
    } catch (dbError) {
      console.warn('MongoDB未启动，使用内存演示数据');
      return res.json({ posts: [...demoPostsStore] });
    }

    res.json({ posts });
  } catch (error: any) {
    res.status(500).json({ message: '获取帖子列表失败', error: error.message });
  }
};

export const getAllComments = async (req: Request, res: Response) => {
  try {
    let comments;
    try {
      comments = await Comment.find()
        .populate('author', 'username')
        .populate('postId', 'title')
        .sort({ createdAt: -1 });
    } catch (dbError) {
      console.warn('MongoDB未启动，使用内存演示数据');
      const allComments = flattenComments(demoCommentsStore).map((c) => ({
        ...c,
        postId: { _id: c.postId, title: demoPostsStore.find((p: any) => p._id === c.postId)?.title || '未知帖子' },
      }));
      return res.json({ comments: allComments });
    }

    res.json({ comments });
  } catch (error: any) {
    res.status(500).json({ message: '获取评论列表失败', error: error.message });
  }
};

export const getSensitiveWords = async (req: Request, res: Response) => {
  try {
    let words;
    let total;
    const { page = 1, limit = 50 } = req.query;

    try {
      words = await SensitiveWord.find()
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
      total = await SensitiveWord.countDocuments();
    } catch (dbError) {
      console.warn('MongoDB未启动，使用内存演示数据');
      return res.json({
        words: [...sensitiveWordsStore],
        pagination: {
          page: 1,
          limit: 50,
          total: sensitiveWordsStore.length,
          pages: 1,
        },
      });
    }

    res.json({
      words,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: '获取敏感词列表失败', error: error.message });
  }
};

export const addSensitiveWord = async (req: Request, res: Response) => {
  try {
    const { word } = req.body;

    if (!word || !word.trim()) {
      return res.status(400).json({ message: '敏感词不能为空' });
    }

    const trimmedWord = word.trim();

    try {
      const existingWord = await SensitiveWord.findOne({ word: trimmedWord });
      if (existingWord) {
        return res.status(400).json({ message: '该敏感词已存在' });
      }

      const sensitiveWord = new SensitiveWord({ word: trimmedWord });
      await sensitiveWord.save();
      await sensitiveWordFilter.reload();

      res.status(201).json({ message: '添加敏感词成功', word: sensitiveWord });
    } catch (dbError) {
      console.warn('内存数据：添加敏感词', trimmedWord);
      const newWord = { _id: 's' + Date.now(), word: trimmedWord, createdAt: new Date().toISOString() };
      sensitiveWordsStore.push(newWord);
      return res.status(201).json({ message: '添加敏感词成功', word: newWord });
    }
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: '该敏感词已存在' });
    }
    res.status(500).json({ message: '添加敏感词失败', error: error.message });
  }
};

export const deleteSensitiveWord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    try {
      const word = await SensitiveWord.findById(id);
      if (!word) {
        return res.status(404).json({ message: '敏感词不存在' });
      }
      await SensitiveWord.findByIdAndDelete(id);
      await sensitiveWordFilter.reload();
    } catch (dbError) {
      console.warn('内存数据：删除敏感词', id);
      const index = sensitiveWordsStore.findIndex((w) => w._id === id);
      if (index > -1) {
        sensitiveWordsStore.splice(index, 1);
      }
      return res.json({ message: '删除敏感词成功' });
    }

    res.json({ message: '删除敏感词成功' });
  } catch (error: any) {
    res.status(500).json({ message: '删除敏感词失败', error: error.message });
  }
};

export const exportPostsToExcel = async (req: Request, res: Response) => {
  try {
    let posts: any[] = [];

    try {
      posts = await Post.find()
        .populate('author', 'username')
        .sort({ createdAt: -1 });
    } catch (dbError) {
      console.warn('MongoDB未启动，导出演示帖子数据');
      posts = [...demoPostsStore];
    }

    const headers = ['ID', '标题', '分类', '作者', '评论状态', '创建时间'];
    const rows = posts.map((p: any) => [
      p._id,
      p.title,
      p.category,
      p.author?.username || '未知',
      p.commentsEnabled ? '开启' : '关闭',
      formatDate(p.createdAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=posts_export.csv');
    res.send('\uFEFF' + csv);
  } catch (error: any) {
    res.status(500).json({ message: '导出失败', error: error.message });
  }
};

export const exportCommentsToExcel = async (req: Request, res: Response) => {
  try {
    let comments: any[] = [];

    try {
      comments = await Comment.find()
        .populate('author', 'username')
        .populate('postId', 'title')
        .sort({ createdAt: -1 });
    } catch (dbError) {
      console.warn('MongoDB未启动，导出演示评论数据');
      const allComments = flattenComments(demoCommentsStore);
      comments = allComments.map((c) => ({
        ...c,
        postId: { _id: c.postId, title: demoPostsStore.find((p: any) => p._id === c.postId)?.title || '未知帖子' },
      }));
    }

    const headers = ['ID', '评论内容', '所属帖子', '评论人', '父评论ID', '创建时间'];
    const rows = comments.map((c: any) => [
      c._id,
      c.content,
      c.postId?.title || '未知',
      c.author?.username || '未知',
      c.parentId || '-',
      formatDate(c.createdAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=comments_export.csv');
    res.send('\uFEFF' + csv);
  } catch (error: any) {
    res.status(500).json({ message: '导出失败', error: error.message });
  }
};
