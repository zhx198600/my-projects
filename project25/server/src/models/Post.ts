import mongoose, { Document, Schema } from 'mongoose';

export type CategoryType = '政治' | '经济' | '科技' | '民生';

export interface IPost extends Document {
  title: string;
  content: string;
  category: CategoryType;
  author: mongoose.Types.ObjectId;
  commentsEnabled: boolean;
  createdAt: Date;
}

const PostSchema: Schema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, '帖子标题不能为空'],
      trim: true,
      maxlength: [200, '帖子标题不能超过200个字符'],
    },
    content: {
      type: String,
      required: [true, '帖子内容不能为空'],
    },
    category: {
      type: String,
      enum: ['政治', '经济', '科技', '民生'],
      required: [true, '帖子分类不能为空'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '帖子作者不能为空'],
    },
    commentsEnabled: {
      type: Boolean,
      default: true,
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

PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ category: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model<IPost>('Post', PostSchema);
