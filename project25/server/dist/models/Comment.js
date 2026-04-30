"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CommentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: [true, '评论内容不能为空'],
        maxlength: [1000, '评论内容不能超过1000个字符'],
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, '评论作者不能为空'],
    },
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, '关联帖子ID不能为空'],
    },
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: false,
});
CommentSchema.index({ postId: 1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ postId: 1, parentId: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.statics.getCommentTree = async function (postId) {
    const comments = await this.find({ postId })
        .populate('author', 'username')
        .sort({ createdAt: 1 });
    const commentMap = new Map();
    const rootComments = [];
    comments.forEach((comment) => {
        const commentObj = comment.toObject();
        commentObj.replies = [];
        commentMap.set(commentObj._id.toString(), commentObj);
        if (!commentObj.parentId) {
            rootComments.push(commentObj);
        }
        else {
            const parent = commentMap.get(commentObj.parentId.toString());
            if (parent) {
                parent.replies.push(commentObj);
            }
        }
    });
    return rootComments;
};
CommentSchema.statics.deleteCommentAndReplies = async function (commentId) {
    const comment = await this.findById(commentId);
    if (!comment)
        return;
    const childComments = await this.find({ parentId: commentId });
    const CommentModel = this;
    for (const childComment of childComments) {
        await CommentModel.deleteCommentAndReplies(childComment._id);
    }
    await this.findByIdAndDelete(commentId);
};
exports.default = mongoose_1.default.model('Comment', CommentSchema);
