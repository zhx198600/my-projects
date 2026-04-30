"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensitiveWord = exports.Comment = exports.Post = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Post_1 = __importDefault(require("./Post"));
exports.Post = Post_1.default;
const Comment_1 = __importDefault(require("./Comment"));
exports.Comment = Comment_1.default;
const SensitiveWord_1 = __importDefault(require("./SensitiveWord"));
exports.SensitiveWord = SensitiveWord_1.default;
