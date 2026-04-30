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
const SensitiveWordSchema = new mongoose_1.Schema({
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
}, {
    timestamps: false,
});
SensitiveWordSchema.index({ word: 1 });
SensitiveWordSchema.index({ word: 'text' });
SensitiveWordSchema.statics.filterText = async function (text) {
    const words = await this.find();
    let filtered = text;
    let hasSensitive = false;
    words.forEach((item) => {
        const regex = new RegExp(item.word, 'gi');
        if (regex.test(filtered)) {
            hasSensitive = true;
            filtered = filtered.replace(regex, '*'.repeat(item.word.length));
        }
    });
    return { filtered, hasSensitive };
};
SensitiveWordSchema.statics.containsSensitive = async function (text) {
    const words = await this.find();
    for (const item of words) {
        const regex = new RegExp(item.word, 'gi');
        if (regex.test(text)) {
            return true;
        }
    }
    return false;
};
exports.default = mongoose_1.default.model('SensitiveWord', SensitiveWordSchema);
