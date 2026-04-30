"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.createComment = exports.getPostComments = exports.getPostById = exports.getPosts = exports.flattenComments = exports.demoCommentsStore = exports.demoPostsStore = exports.createPost = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Post_1 = __importDefault(require("../models/Post"));
const Comment_1 = __importDefault(require("../models/Comment"));
const createPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        if (!title || !content || !category) {
            return res.status(400).json({ message: '请填写所有必填字段' });
        }
        const fakeSensitiveCheck = (text) => {
            const fakeWords = ['暴力', '色情', '赌博', '毒品'];
            const found = fakeWords.filter((w) => text.includes(w));
            return { hasSensitive: found.length > 0, words: found };
        };
        const titleCheck = fakeSensitiveCheck(title);
        const contentCheck = fakeSensitiveCheck(content);
        if (titleCheck.hasSensitive || contentCheck.hasSensitive) {
            const allSensitiveWords = [...new Set([...titleCheck.words, ...contentCheck.words])];
            return res.status(400).json({
                message: `内容包含敏感词：${allSensitiveWords.join('、')}，请修改后重新发布`,
                sensitiveWords: allSensitiveWords,
            });
        }
        let post;
        try {
            post = new Post_1.default({
                title,
                content,
                category,
                author: new mongoose_1.default.Types.ObjectId(req.user.id),
            });
            await post.save();
            await post.populate('author', 'username');
        }
        catch (dbError) {
            console.warn('演示模式：发帖成功');
            return res.status(201).json({
                message: '演示模式：发帖成功',
                post: {
                    _id: 'new-' + Date.now(),
                    title,
                    content,
                    category,
                    author: req.user || { _id: 'demo', username: '演示用户' },
                    commentsEnabled: true,
                    createdAt: new Date().toISOString(),
                },
            });
        }
        res.status(201).json({ message: '发帖成功', post });
    }
    catch (error) {
        res.status(500).json({ message: '发帖失败', error: error.message });
    }
};
exports.createPost = createPost;
exports.demoPostsStore = [
    {
        _id: '1',
        title: '2024年经济发展展望与政策分析',
        content: '# 经济发展展望\n\n随着全球经济的复苏，2024年将是关键的一年。本文将从以下几个方面进行分析：\n\n## 主要指标预测\n\n- GDP增长率预计达到5%\n- 就业率稳步提升\n- 消费市场持续回暖\n\n## 政策建议\n\n**加大基础设施投入**，支持中小企业发展。',
        category: '经济',
        author: { _id: 'a1', username: '经济观察员' },
        commentsEnabled: true,
        createdAt: new Date().toISOString(),
    },
    {
        _id: '2',
        title: '人工智能技术在民生领域的应用',
        content: '## AI与民生\n\n人工智能正在深刻改变我们的生活方式。从智慧医疗到智能家居，AI技术的应用无处不在。\n\n### 智慧医疗\n\n远程诊断、智能影像识别、个性化治疗方案。\n\n### 教育科技\n\n自适应学习系统、智能辅导机器人。',
        category: '科技',
        author: { _id: 'a2', username: '科技达人' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        _id: '3',
        title: '社区治理的新模式探讨',
        content: '随着城市化进程的加速，社区治理面临新的挑战和机遇。\n\n1. 党建引领社区治理\n2. 数字化社区平台建设\n3. 志愿者服务体系完善',
        category: '民生',
        author: { _id: 'a3', username: '社区工作者' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        _id: '4',
        title: '数字经济发展与数据安全',
        content: '### 数据安全是底线\n\n在发展数字经济的同时，必须高度重视数据安全和个人隐私保护。\n\n> 安全是发展的前提，发展是安全的保障。',
        category: '政治',
        author: { _id: 'a4', username: '政策研究员' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
    {
        _id: '5',
        title: '新能源产业发展趋势报告',
        content: '## 光伏与风电\n\n新能源产业正在迎来爆发式增长，技术突破带来成本下降。',
        category: '经济',
        author: { _id: 'a5', username: '能源分析师' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
        _id: '6',
        title: 'ChatGPT与大模型技术演进',
        content: '大语言模型正在改变人机交互的方式。',
        category: '科技',
        author: { _id: 'a6', username: 'AI开发者' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 18000000).toISOString(),
    },
    {
        _id: '7',
        title: '老旧小区改造的民生意义',
        content: '老旧小区改造不仅是民生工程，更是城市更新的重要组成部分。',
        category: '民生',
        author: { _id: 'a7', username: '城建专家' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 21600000).toISOString(),
    },
    {
        _id: '8',
        title: '乡村振兴战略实施路径',
        content: '产业兴旺、生态宜居、乡风文明、治理有效、生活富裕。',
        category: '政治',
        author: { _id: 'a8', username: '三农学者' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 25200000).toISOString(),
    },
    {
        _id: '9',
        title: '消费升级与零售业转型',
        content: '品质消费、体验消费、服务消费成为新趋势。',
        category: '经济',
        author: { _id: 'a9', username: '零售观察' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 28800000).toISOString(),
    },
    {
        _id: '10',
        title: '元宇宙概念与产业应用',
        content: '虚拟现实与增强现实技术正在融合发展。',
        category: '科技',
        author: { _id: 'a10', username: 'VR从业者' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 32400000).toISOString(),
    },
    {
        _id: '11',
        title: '医疗保障制度改革深化',
        content: '异地就医结算、门诊共济保障机制不断完善。',
        category: '民生',
        author: { _id: 'a11', username: '医保研究员' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 36000000).toISOString(),
    },
    {
        _id: '12',
        title: '双循环新发展格局解读',
        content: '构建以国内大循环为主体、国内国际双循环相互促进的新发展格局。',
        category: '政治',
        author: { _id: 'a12', username: '宏观经济' },
        commentsEnabled: true,
        createdAt: new Date(Date.now() - 39600000).toISOString(),
    },
];
exports.demoCommentsStore = [
    {
        _id: 'c1',
        content: '**写得非常好！** 分析得很到位，期待后续更多内容。',
        author: { _id: 'u1', username: '热心网友' },
        postId: '1',
        parentId: null,
        createdAt: new Date().toISOString(),
        children: [
            {
                _id: 'c2',
                content: '同意！特别是关于就业率的分析很有见地。',
                author: { _id: 'u2', username: '经济学人' },
                postId: '1',
                parentId: 'c1',
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                children: [
                    {
                        _id: 'c3',
                        content: '> 特别是关于就业率的分析很有见地\n\n是的，数据支撑也很充分👍',
                        author: { _id: 'u3', username: '数据分析师' },
                        postId: '1',
                        parentId: 'c2',
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        children: [],
                    },
                ],
            },
        ],
    },
    {
        _id: 'c4',
        content: '## 补充一点\n\n政策的落地执行也很关键，希望能看到更多具体措施出台。',
        author: { _id: 'u4', username: '务实派' },
        postId: '1',
        parentId: null,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        children: [],
    },
    {
        _id: 'c5',
        content: 'AI技术发展太快了，期待更多落地应用！',
        author: { _id: 'u5', username: '科技爱好者' },
        postId: '2',
        parentId: null,
        createdAt: new Date(Date.now() - 9000000).toISOString(),
        children: [],
    },
];
const flattenComments = (comments) => {
    let result = [];
    comments.forEach((c) => {
        result.push({ ...c, children: undefined });
        if (c.children && c.children.length > 0) {
            result = result.concat((0, exports.flattenComments)(c.children));
        }
    });
    return result;
};
exports.flattenComments = flattenComments;
const getPosts = async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        const query = {};
        if (category && category !== '全部') {
            query.category = category;
        }
        let posts;
        let total;
        try {
            posts = await Post_1.default.find(query)
                .populate('author', 'username')
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));
            total = await Post_1.default.countDocuments(query);
        }
        catch (dbError) {
            console.warn('MongoDB未启动，使用内存演示数据');
            let filteredPosts = [...exports.demoPostsStore];
            if (category && category !== '全部') {
                filteredPosts = exports.demoPostsStore.filter((p) => p.category === category);
            }
            const startIndex = (Number(page) - 1) * Number(limit);
            const endIndex = startIndex + Number(limit);
            const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
            return res.json({
                posts: paginatedPosts,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: filteredPosts.length,
                    pages: Math.ceil(filteredPosts.length / Number(limit)),
                },
            });
        }
        res.json({
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: '获取帖子列表失败', error: error.message });
    }
};
exports.getPosts = getPosts;
const getPostById = async (req, res) => {
    try {
        let post;
        try {
            post = await Post_1.default.findById(req.params.id).populate('author', 'username');
        }
        catch (dbError) {
            console.warn('MongoDB未启动，返回演示帖子详情');
            const demoPost = exports.demoPostsStore.find((p) => p._id === req.params.id) || exports.demoPostsStore[0];
            return res.json({ post: demoPost });
        }
        if (!post) {
            return res.status(404).json({ message: '帖子不存在' });
        }
        res.json({ post });
    }
    catch (error) {
        res.status(500).json({ message: '获取帖子详情失败', error: error.message });
    }
};
exports.getPostById = getPostById;
const getPostComments = async (req, res) => {
    try {
        let comments;
        try {
            const post = await Post_1.default.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ message: '帖子不存在' });
            }
            const CommentModel = Comment_1.default;
            comments = await CommentModel.getCommentTree(post._id);
        }
        catch (dbError) {
            console.warn('MongoDB未启动，返回演示评论数据');
            const postComments = exports.demoCommentsStore.filter((c) => c.postId === req.params.id && !c.parentId);
            return res.json({ comments: postComments });
        }
        res.json({ comments });
    }
    catch (error) {
        res.status(500).json({ message: '获取评论失败', error: error.message });
    }
};
exports.getPostComments = getPostComments;
const createComment = async (req, res) => {
    try {
        const { content, parentId } = req.body;
        if (!content) {
            return res.status(400).json({ message: '评论内容不能为空' });
        }
        const fakeSensitiveCheck = (text) => {
            const fakeWords = ['暴力', '色情', '赌博', '毒品'];
            const found = fakeWords.filter((w) => text.includes(w));
            return { hasSensitive: found.length > 0, words: found };
        };
        const contentCheck = fakeSensitiveCheck(content);
        if (contentCheck.hasSensitive) {
            return res.status(400).json({
                message: `评论包含敏感词：${contentCheck.words.join('、')}，请修改后重新评论`,
                sensitiveWords: contentCheck.words,
            });
        }
        try {
            const post = await Post_1.default.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ message: '帖子不存在' });
            }
            if (!post.commentsEnabled) {
                return res.status(403).json({ message: '该帖子已关闭评论' });
            }
            if (parentId) {
                const parentComment = await Comment_1.default.findById(parentId);
                if (!parentComment || parentComment.postId.toString() !== post._id.toString()) {
                    return res.status(400).json({ message: '父评论不存在或不属于该帖子' });
                }
            }
            const comment = new Comment_1.default({
                content,
                postId: post._id,
                author: new mongoose_1.default.Types.ObjectId(req.user.id),
                parentId: parentId ? new mongoose_1.default.Types.ObjectId(parentId) : null,
            });
            await comment.save();
            await comment.populate('author', 'username');
            res.status(201).json({ message: '评论成功', comment });
        }
        catch (dbError) {
            console.warn('演示模式：评论成功');
            return res.status(201).json({
                message: '演示模式：评论成功',
                comment: {
                    _id: 'new-c-' + Date.now(),
                    content,
                    author: req.user || { _id: 'demo', username: '演示用户' },
                    postId: req.params.id,
                    parentId: parentId || null,
                    createdAt: new Date().toISOString(),
                    children: [],
                },
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: '评论失败', error: error.message });
    }
};
exports.createComment = createComment;
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;
        try {
            const comment = await Comment_1.default.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: '评论不存在' });
            }
            if (comment.author.toString() !== userId) {
                return res.status(403).json({ message: '无权限删除该评论' });
            }
            const CommentModel = Comment_1.default;
            await CommentModel.deleteCommentAndReplies(commentId);
            res.json({ message: '评论删除成功' });
        }
        catch (dbError) {
            console.warn('演示模式：删除评论成功');
            return res.json({ message: '演示模式：评论删除成功' });
        }
    }
    catch (error) {
        res.status(500).json({ message: '删除评论失败', error: error.message });
    }
};
exports.deleteComment = deleteComment;
