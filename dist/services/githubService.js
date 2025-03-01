"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRepositoryFilesRecursive = fetchRepositoryFilesRecursive;
exports.downloadFileContent = downloadFileContent;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
/**
 * Recursively fetches all files from a GitHub repository starting at a given path.
 *
 * @param owner - GitHub username or organization.
 * @param repo - Repository name.
 * @param path - The path to start from (default is the repository root).
 * @returns An array of file objects.
 */
function fetchRepositoryFilesRecursive(owner_1, repo_1) {
    return __awaiter(this, arguments, void 0, function* (owner, repo, path = "") {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const response = yield axios_1.default.get(url, {
            headers: {
                Authorization: `token ${config_1.config.githubToken}`,
            },
        });
        const items = response.data;
        let files = [];
        for (const item of items) {
            if (item.type === 'dir') {
                const subFiles = yield fetchRepositoryFilesRecursive(owner, repo, item.path);
                files = files.concat(subFiles);
            }
            else if (item.type === 'file') {
                files.push(item);
            }
        }
        return files;
    });
}
/**
 * Downloads file content given a download URL.
 *
 * @param url - The download URL for the file.
 * @returns The text content of the file.
 */
function downloadFileContent(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(url);
        return response.data;
    });
}
