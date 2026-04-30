import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, '评论内容不能为空'],
      maxlength: [1000, '评论内容不能超过1000个字符'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '评论作者不能为空'],
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, '关联帖子ID不能为空'],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

CommentSchema.index({ postId: 1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ postId: 1, parentId: 1 });
CommentSchema.index({ createdAt: -1 });

CommentSchema.statics.getCommentTree = async function (
  postId: mongoose.Types.ObjectId
): Promise<any[]> {
  const comments = await this.find({ postId })
    .populate('author', 'username')
    .sort({ createdAt: 1 });

  const commentMap = new Map();
  const rootComments: any[] = [];

  comments.forEach((comment: any) => {
    const commentObj = comment.toObject();
    commentObj.replies = [];
    commentMap.set(commentObj._id.toString(), commentObj);

    if (!commentObj.parentId) {
      rootComments.push(commentObj);
    } else {
      const parent = commentMap.get(commentObj.parentId.toString());
      if (parent) {
        parent.replies.push(commentObj);
      }
    }
  });

  return rootComments;
};

CommentSchema.statics.deleteCommentAndReplies = async function (
  commentId: mongoose.Types.ObjectId
): Promise<void> {
  const comment = await this.findById(commentId);
  if (!comment) return;

  const childComments = await this.find({ parentId: commentId });
  const CommentModel = this as any;
  for (const childComment of childComments) {
    await CommentModel.deleteCommentAndReplies(childComment._id);
  }

  await this.findByIdAndDelete(commentId);
};

export default mongoose.model<IComment>('Comment', CommentSchema);
