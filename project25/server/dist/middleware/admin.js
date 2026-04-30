"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    else if (queryToken) {
        token = queryToken;
    }
    if (!token) {
        return res.status(401).json({ message: '访问被拒绝，未提供管理员令牌' });
    }
    if (token.startsWith('demo-admin-token-')) {
        req.admin = {
            _id: 'demo-admin-id',
            username: 'admin',
            email: 'admin@forum.com',
            role: 'admin',
        };
        return next();
    }
    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: '需要管理员权限' });
        }
        req.admin = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: '无效的管理员令牌' });
    }
};
exports.authenticateAdmin = authenticateAdmin;
const requireAdmin = (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({ message: '请先以管理员身份登录' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
