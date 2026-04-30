import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import { authenticateAdmin } from './middleware/admin';
import {
  deletePost,
  deleteComment,
  toggleCommentsStatus,
  getAllPosts,
  getAllComments,
  getSensitiveWords,
  addSensitiveWord,
  deleteSensitiveWord,
  exportPostsToExcel,
  exportCommentsToExcel,
} from './controllers/adminController';
import { sensitiveWordFilter } from './utils/sensitiveWordFilter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Forum API Server is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const adminRouter = express.Router();
adminRouter.use(authenticateAdmin);
adminRouter.delete('/posts/:id', deletePost);
adminRouter.delete('/comments/:id', deleteComment);
adminRouter.patch('/posts/:id/comments-status', toggleCommentsStatus);
adminRouter.get('/posts', getAllPosts);
adminRouter.get('/comments', getAllComments);
adminRouter.get('/sensitive-words', getSensitiveWords);
adminRouter.post('/sensitive-words', addSensitiveWord);
adminRouter.delete('/sensitive-words/:id', deleteSensitiveWord);
adminRouter.get('/export/posts', exportPostsToExcel);
adminRouter.get('/export/comments', exportCommentsToExcel);
app.use('/api/admin', adminRouter);

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  });
  
  try {
    await connectDatabase();
    await sensitiveWordFilter.init();
    console.log('\n📚 Available routes:');
    console.log(`Auth routes:`);
    console.log(`  POST /api/auth/register - 用户注册`);
    console.log(`  POST /api/auth/login - 用户登录`);
    console.log(`  POST /api/auth/admin/login - 管理员登录`);
    console.log(`  GET /api/auth/me - 获取当前用户信息`);
    console.log(`Post routes:`);
    console.log(`  GET /api/posts - 获取帖子列表（公开）`);
    console.log(`  GET /api/posts/:id - 获取帖子详情（公开）`);
    console.log(`  POST /api/posts - 发帖（需登录）`);
    console.log(`  GET /api/posts/:id/comments - 获取评论（公开）`);
    console.log(`  POST /api/posts/:id/comments - 评论（需登录）`);
    console.log(`Admin routes (需管理员权限):`);
    console.log(`  DELETE /api/admin/posts/:id - 删除帖子`);
    console.log(`  DELETE /api/admin/comments/:id - 删除评论`);
    console.log(`  PATCH /api/admin/posts/:id/comments-status - 设置帖子评论状态`);
    console.log(`  GET /api/admin/posts - 获取所有帖子列表`);
    console.log(`  GET /api/admin/comments - 获取所有评论列表`);
    console.log(`  GET /api/admin/sensitive-words - 获取敏感词列表`);
    console.log(`  POST /api/admin/sensitive-words - 添加敏感词`);
    console.log(`  DELETE /api/admin/sensitive-words/:id - 删除敏感词`);
  } catch (error) {
    console.warn('\n⚠️  数据库初始化警告:', error);
  }
};

startServer();
