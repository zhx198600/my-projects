"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCommentsToExcel = exports.exportPostsToExcel = exports.deleteSensitiveWord = exports.addSensitiveWord = exports.getSensitiveWords = exports.getAllComments = exports.getAllPosts = exports.toggleCommentsStatus = exports.deleteComment = exports.deletePost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const Comment_1 = __importDefault(require("../models/Comment"));
const SensitiveWord_1 = __importDefault(require("../models/SensitiveWord"));
const sensitiveWordFilter_1 = require("../utils/sensitiveWordFilter");
const postController_1 = require("./postController");
const escapeCsv = (str) => {
    if (!str)
        return '';
    const s = String(str).replace(/"/g, '""');
    return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
};
const formatDate = (dateStr) => {
    if (!dateStr)
        return '';
    return new Date(dateStr).toLocaleString('zh-CN');
};
let sensitiveWordsStore = [
    { _id: 's1', word: '暴力', createdAt: new Date().toISOString() },
    { _id: 's2', word: '色情', createdAt: new Date().toISOString() },
    { _id: 's3', word: '赌博', createdAt: new Date().toISOString() },
];
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        try {
            const post = await Post_1.default.findById(id);
            if (!post) {
                return res.status(404).json({ message: '帖子不存在' });
            }
            await Comment_1.default.deleteMany({ postId: post._id });
            await Post_1.default.findByIdAndDelete(id);
        }
        catch (dbError) {
            console.warn('内存数据：删除帖子', id);
            const index = postController_1.demoPostsStore.findIndex((p) => p._id === id);
            if (index > -1) {
                postController_1.demoPostsStore.splice(index, 1);
            }
            return res.json({ message: '帖子删除成功' });
        }
        res.json({ message: '帖子删除成功' });
    }
    catch (error) {
        res.status(500).json({ message: '删除帖子失败', error: error.message });
    }
};
exports.deletePost = deletePost;
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        try {
            const comment = await Comment_1.default.findById(id);
            if (!comment) {
                return res.status(404).json({ message: '评论不存在' });
            }
            const CommentModel = Comment_1.default;
            await CommentModel.deleteCommentAndReplies(id);
        }
        catch (dbError) {
            console.warn('内存数据：删除评论', id);
            const cid = String(id);
            const removeById = (comments) => {
                return comments.filter((c) => {
                    if (c._id === cid)
                        return false;
                    if (c.children && c.children.length > 0) {
                        c.children = removeById(c.children);
                    }
                    return true;
                });
            };
            const newComments = removeById(postController_1.demoCommentsStore);
            postController_1.demoCommentsStore.length = 0;
            postController_1.demoCommentsStore.push(...newComments);
            return res.json({ message: '评论删除成功' });
        }
        res.json({ message: '评论删除成功' });
    }
    catch (error) {
        res.status(500).json({ message: '删除评论失败', error: error.message });
    }
};
exports.deleteComment = deleteComment;
const toggleCommentsStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { commentsEnabled } = req.body;
        if (typeof commentsEnabled !== 'boolean') {
            return res.status(400).json({ message: 'commentsEnabled 必须是布尔值' });
        }
        try {
            const post = await Post_1.default.findById(id);
            if (!post) {
                return res.status(404).json({ message: '帖子不存在' });
            }
            post.commentsEnabled = commentsEnabled;
            await post.save();
        }
        catch (dbError) {
            console.warn('内存数据：设置评论状态', id, commentsEnabled);
            const post = postController_1.demoPostsStore.find((p) => p._id === id);
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
    }
    catch (error) {
        res.status(500).json({ message: '设置评论状态失败', error: error.message });
    }
};
exports.toggleCommentsStatus = toggleCommentsStatus;
const getAllPosts = async (req, res) => {
    try {
        let posts;
        try {
            posts = await Post_1.default.find()
                .populate('author', 'username')
                .sort({ createdAt: -1 });
        }
        catch (dbError) {
            console.warn('MongoDB未启动，使用内存演示数据');
            return res.json({ posts: [...postController_1.demoPostsStore] });
        }
        res.json({ posts });
    }
    catch (error) {
        res.status(500).json({ message: '获取帖子列表失败', error: error.message });
    }
};
exports.getAllPosts = getAllPosts;
const getAllComments = async (req, res) => {
    try {
        let comments;
        try {
            comments = await Comment_1.default.find()
                .populate('author', 'username')
                .populate('postId', 'title')
                .sort({ createdAt: -1 });
        }
        catch (dbError) {
            console.warn('MongoDB未启动，使用内存演示数据');
            const allComments = (0, postController_1.flattenComments)(postController_1.demoCommentsStore).map((c) => ({
                ...c,
                postId: { _id: c.postId, title: postController_1.demoPostsStore.find((p) => p._id === c.postId)?.title || '未知帖子' },
            }));
            return res.json({ comments: allComments });
        }
        res.json({ comments });
    }
    catch (error) {
        res.status(500).json({ message: '获取评论列表失败', error: error.message });
    }
};
exports.getAllComments = getAllComments;
const getSensitiveWords = async (req, res) => {
    try {
        let words;
        let total;
        const { page = 1, limit = 50 } = req.query;
        try {
            words = await SensitiveWord_1.default.find()
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));
            total = await SensitiveWord_1.default.countDocuments();
        }
        catch (dbError) {
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
    }
    catch (error) {
        res.status(500).json({ message: '获取敏感词列表失败', error: error.message });
    }
};
exports.getSensitiveWords = getSensitiveWords;
const addSensitiveWord = async (req, res) => {
    try {
        const { word } = req.body;
        if (!word || !word.trim()) {
            return res.status(400).json({ message: '敏感词不能为空' });
        }
        const trimmedWord = word.trim();
        try {
            const existingWord = await SensitiveWord_1.default.findOne({ word: trimmedWord });
            if (existingWord) {
                return res.status(400).json({ message: '该敏感词已存在' });
            }
            const sensitiveWord = new SensitiveWord_1.default({ word: trimmedWord });
            await sensitiveWord.save();
            await sensitiveWordFilter_1.sensitiveWordFilter.reload();
            res.status(201).json({ message: '添加敏感词成功', word: sensitiveWord });
        }
        catch (dbError) {
            console.warn('内存数据：添加敏感词', trimmedWord);
            const newWord = { _id: 's' + Date.now(), word: trimmedWord, createdAt: new Date().toISOString() };
            sensitiveWordsStore.push(newWord);
            return res.status(201).json({ message: '添加敏感词成功', word: newWord });
        }
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: '该敏感词已存在' });
        }
        res.status(500).json({ message: '添加敏感词失败', error: error.message });
    }
};
exports.addSensitiveWord = addSensitiveWord;
const deleteSensitiveWord = async (req, res) => {
    try {
        const { id } = req.params;
        try {
            const word = await SensitiveWord_1.default.findById(id);
            if (!word) {
                return res.status(404).json({ message: '敏感词不存在' });
            }
            await SensitiveWord_1.default.findByIdAndDelete(id);
            await sensitiveWordFilter_1.sensitiveWordFilter.reload();
        }
        catch (dbError) {
            console.warn('内存数据：删除敏感词', id);
            const index = sensitiveWordsStore.findIndex((w) => w._id === id);
            if (index > -1) {
                sensitiveWordsStore.splice(index, 1);
            }
            return res.json({ message: '删除敏感词成功' });
        }
        res.json({ message: '删除敏感词成功' });
    }
    catch (error) {
        res.status(500).json({ message: '删除敏感词失败', error: error.message });
    }
};
exports.deleteSensitiveWord = deleteSensitiveWord;
const exportPostsToExcel = async (req, res) => {
    try {
        let posts = [];
        try {
            posts = await Post_1.default.find()
                .populate('author', 'username')
                .sort({ createdAt: -1 });
        }
        catch (dbError) {
            console.warn('MongoDB未启动，导出演示帖子数据');
            posts = [...postController_1.demoPostsStore];
        }
        const headers = ['ID', '标题', '分类', '作者', '评论状态', '创建时间'];
        const rows = posts.map((p) => [
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
    }
    catch (error) {
        res.status(500).json({ message: '导出失败', error: error.message });
    }
};
exports.exportPostsToExcel = exportPostsToExcel;
const exportCommentsToExcel = async (req, res) => {
    try {
        let comments = [];
        try {
            comments = await Comment_1.default.find()
                .populate('author', 'username')
                .populate('postId', 'title')
                .sort({ createdAt: -1 });
        }
        catch (dbError) {
            console.warn('MongoDB未启动，导出演示评论数据');
            const allComments = (0, postController_1.flattenComments)(postController_1.demoCommentsStore);
            comments = allComments.map((c) => ({
                ...c,
                postId: { _id: c.postId, title: postController_1.demoPostsStore.find((p) => p._id === c.postId)?.title || '未知帖子' },
            }));
        }
        const headers = ['ID', '评论内容', '所属帖子', '评论人', '父评论ID', '创建时间'];
        const rows = comments.map((c) => [
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
    }
    catch (error) {
        res.status(500).json({ message: '导出失败', error: error.message });
    }
};
exports.exportCommentsToExcel = exportCommentsToExcel;
