"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.adminLogin = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => {
    return EMAIL_REGEX.test(email);
};
const generateToken = (user) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    return jsonwebtoken_1.default.sign({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    }, JWT_SECRET, { expiresIn: '7d' });
};
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: '请填写所有必填字段' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: '请输入有效的邮箱格式' });
        }
        try {
            const existingUser = await User_1.default.findOne({
                $or: [{ username }, { email }],
            });
            if (existingUser) {
                return res.status(400).json({ message: '用户名或邮箱已存在' });
            }
            const user = new User_1.default({
                username,
                email,
                password,
                role: 'user',
            });
            await user.save();
            const token = generateToken(user);
            res.status(201).json({
                message: '注册成功',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (dbError) {
            console.warn('演示模式：注册成功');
            const token = 'demo-token-' + Date.now();
            res.status(201).json({
                message: '演示模式：注册成功',
                token,
                user: {
                    id: 'demo-' + username,
                    username,
                    email,
                    role: 'user',
                },
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: '注册失败', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const loginId = username || email;
        if (!loginId || !password) {
            return res.status(400).json({ message: '请填写账号和密码' });
        }
        let user;
        try {
            user = await User_1.default.findOne({
                $or: [{ username: loginId }, { email: loginId }],
            });
        }
        catch (dbError) {
            console.warn('MongoDB未启动，使用演示模式登录');
            return res.json({
                message: '演示模式登录成功',
                token: 'demo-token-' + Date.now(),
                user: {
                    id: 'demo-user-id',
                    username: loginId.includes('@') ? loginId.split('@')[0] : loginId,
                    email: isValidEmail(loginId) ? loginId : `${loginId}@demo.com`,
                    role: 'user',
                },
            });
        }
        if (!user) {
            return res.status(401).json({ message: '账号或密码错误' });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '账号或密码错误' });
        }
        const token = generateToken(user);
        res.json({
            message: '登录成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: '登录失败', error: error.message });
    }
};
exports.login = login;
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: '请填写用户名和密码' });
        }
        if (username === 'admin' && password === 'admin123') {
            return res.json({
                message: '演示模式管理员登录成功',
                token: 'demo-admin-token-' + Date.now(),
                user: {
                    id: 'demo-admin-id',
                    username: 'admin',
                    email: 'admin@forum.com',
                    role: 'admin',
                },
            });
        }
        let user;
        try {
            user = await User_1.default.findOne({ username });
        }
        catch (dbError) {
            return res.status(401).json({ message: '用户名或密码错误，演示模式请用 admin/admin123' });
        }
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ message: '需要管理员权限' });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }
        const token = generateToken(user);
        res.json({
            message: '管理员登录成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: '登录失败', error: error.message });
    }
};
exports.adminLogin = adminLogin;
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: '请先登录' });
        }
        const user = await User_1.default.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: '获取用户信息失败', error: error.message });
    }
};
exports.getCurrentUser = getCurrentUser;
