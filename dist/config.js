"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    githubToken: process.env.GITHUB_TOKEN || '',
    cohereApiKey: process.env.COHERE_API_KEY || '',
    databaseUrl: process.env.DATABASE_URL || '',
};
