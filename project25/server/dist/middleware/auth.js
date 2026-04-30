"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '访问被拒绝，未提供令牌' });
    }
    const token = authHeader.split(' ')[1];
    if (token.startsWith('demo-token-') || token.startsWith('demo-admin-token-')) {
        const isAdmin = token.startsWith('demo-admin-token-');
        req.user = {
            _id: isAdmin ? 'demo-admin-id' : 'demo-user-id',
            username: isAdmin ? 'admin' : '演示用户',
            email: isAdmin ? 'admin@forum.com' : 'user@demo.com',
            role: isAdmin ? 'admin' : 'user',
        };
        return next();
    }
    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: '无效的令牌' });
    }
};
exports.authenticate = authenticate;
const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: '请先登录' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
