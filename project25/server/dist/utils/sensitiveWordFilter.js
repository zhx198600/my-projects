"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sensitiveWordFilter = void 0;
const SensitiveWord_1 = __importDefault(require("../models/SensitiveWord"));
class SensitiveWordFilter {
    constructor() {
        this.root = new Map();
        this.isInitialized = false;
    }
    async init() {
        const words = await SensitiveWord_1.default.find();
        this.buildTree(words.map(w => w.word));
        this.isInitialized = true;
        console.log(`DFA树构建完成，共加载 ${words.length} 个敏感词`);
    }
    async reload() {
        this.root = new Map();
        this.isInitialized = false;
        await this.init();
    }
    buildTree(words) {
        for (const word of words) {
            this.addWord(word);
        }
    }
    addWord(word) {
        let node = this.root;
        const chars = Array.from(word.toLowerCase().trim());
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            if (!node.has(char)) {
                const newNode = new Map();
                node.set(char, newNode);
                node = newNode;
            }
            else {
                node = node.get(char);
            }
            if (i === chars.length - 1) {
                node.set('isEnd', true);
            }
        }
    }
    containsSensitive(text) {
        if (!this.isInitialized) {
            return { hasSensitive: false, words: [] };
        }
        const foundWords = new Set();
        const chars = Array.from(text.toLowerCase());
        for (let i = 0; i < chars.length; i++) {
            let node = this.root;
            let j = i;
            let wordBuilder = '';
            while (j < chars.length && node.has(chars[j])) {
                const char = chars[j];
                wordBuilder += char;
                node = node.get(char);
                if (node.get('isEnd') === true) {
                    foundWords.add(wordBuilder);
                }
                j++;
            }
        }
        return {
            hasSensitive: foundWords.size > 0,
            words: Array.from(foundWords)
        };
    }
    filterText(text, replaceChar = '*') {
        if (!this.isInitialized) {
            return { filtered: text, hasSensitive: false, words: [] };
        }
        const result = this.containsSensitive(text);
        if (!result.hasSensitive) {
            return { filtered: text, hasSensitive: false, words: [] };
        }
        let filtered = text;
        for (const word of result.words) {
            const regex = new RegExp(this.escapeRegex(word), 'gi');
            filtered = filtered.replace(regex, replaceChar.repeat(word.length));
        }
        return {
            filtered,
            hasSensitive: true,
            words: result.words
        };
    }
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
exports.sensitiveWordFilter = new SensitiveWordFilter();
exports.default = exports.sensitiveWordFilter;
