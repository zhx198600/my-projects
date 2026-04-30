"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const admin_1 = require("./middleware/admin");
const adminController_1 = require("./controllers/adminController");
const sensitiveWordFilter_1 = require("./utils/sensitiveWordFilter");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Forum API Server is running!' });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/posts', postRoutes_1.default);
const adminRouter = express_1.default.Router();
adminRouter.use(admin_1.authenticateAdmin);
adminRouter.delete('/posts/:id', adminController_1.deletePost);
adminRouter.delete('/comments/:id', adminController_1.deleteComment);
adminRouter.patch('/posts/:id/comments-status', adminController_1.toggleCommentsStatus);
adminRouter.get('/posts', adminController_1.getAllPosts);
adminRouter.get('/comments', adminController_1.getAllComments);
adminRouter.get('/sensitive-words', adminController_1.getSensitiveWords);
adminRouter.post('/sensitive-words', adminController_1.addSensitiveWord);
adminRouter.delete('/sensitive-words/:id', adminController_1.deleteSensitiveWord);
adminRouter.get('/export/posts', adminController_1.exportPostsToExcel);
adminRouter.get('/export/comments', adminController_1.exportCommentsToExcel);
app.use('/api/admin', adminRouter);
const startServer = async () => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    });
    try {
        await (0, database_1.connectDatabase)();
        await sensitiveWordFilter_1.sensitiveWordFilter.init();
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
    }
    catch (error) {
        console.warn('\n⚠️  数据库初始化警告:', error);
    }
};
startServer();
