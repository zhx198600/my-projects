import mongoose, { Document, Schema } from 'mongoose';

export interface ISensitiveWord extends Document {
  word: string;
  createdAt: Date;
}

const SensitiveWordSchema: Schema = new Schema<ISensitiveWord>(
  {
    word: {
      type: String,
      required: [true, '敏感词不能为空'],
      unique: true,
      trim: true,
      maxlength: [100, '敏感词不能超过100个字符'],
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

SensitiveWordSchema.index({ word: 1 });
SensitiveWordSchema.index({ word: 'text' });

SensitiveWordSchema.statics.filterText = async function (text: string): Promise<{ filtered: string; hasSensitive: boolean }> {
  const words = await this.find();
  let filtered = text;
  let hasSensitive = false;

  words.forEach((item: ISensitiveWord) => {
    const regex = new RegExp(item.word, 'gi');
    if (regex.test(filtered)) {
      hasSensitive = true;
      filtered = filtered.replace(regex, '*'.repeat(item.word.length));
    }
  });

  return { filtered, hasSensitive };
};

SensitiveWordSchema.statics.containsSensitive = async function (text: string): Promise<boolean> {
  const words = await this.find();
  for (const item of words) {
    const regex = new RegExp(item.word, 'gi');
    if (regex.test(text)) {
      return true;
    }
  }
  return false;
};

export default mongoose.model<ISensitiveWord>('SensitiveWord', SensitiveWordSchema);
