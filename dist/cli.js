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
const ragService_1 = require("./services/ragService");
const githubService_1 = require("./services/githubService");
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const database_1 = require("./db/database");
const inquirer_1 = __importDefault(require("inquirer"));
const program = new commander_1.Command();
function authenticate() {
    return __awaiter(this, void 0, void 0, function* () {
        // Tokens are assumed to be set in the .env file.
        return;
    });
}
/**
 * Splits file content into smaller chunks.
 * You can customize the chunk size (e.g., number of lines per chunk).
 */
function chunkContent(content, linesPerChunk = 20) {
    const lines = content.split(/\r?\n/);
    const chunks = [];
    for (let i = 0; i < lines.length; i += linesPerChunk) {
        const chunkLines = lines.slice(i, i + linesPerChunk);
        // Only index chunks that have some content
        if (chunkLines.join("\n").trim()) {
            chunks.push({
                title: `Chunk ${i + 1}`,
                content: chunkLines.join("\n"),
            });
        }
    }
    return chunks;
}
program
    .name('repnalyzer')
    .description('CLI tool for semantic document search in GitHub repositories using Cohere AI')
    .version('1.0.0');
program
    .command('index <owner> <repo>')
    .description('Index files (and code chunks) from a GitHub repository for semantic search')
    .action((owner, repo) => __awaiter(void 0, void 0, void 0, function* () {
    yield authenticate();
    yield (0, database_1.connectToDatabase)(); // For future expansion; you might later store indexes in a DB.
    try {
        console.log(chalk_1.default.blue("Fetching repository files recursively..."));
        const files = yield (0, githubService_1.fetchRepositoryFilesRecursive)(owner, repo);
        // Filter to text files (you can add more sophisticated filtering if needed)
        const textFiles = files.filter(file => {
            // Simple check: file must have a download_url and its extension is not one of the known binary types.
            const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip'];
            return file.download_url && !binaryExtensions.some(ext => file.name.endsWith(ext));
        });
        const documents = [];
        for (const file of textFiles) {
            try {
                console.log(`Downloading content for file: ${file.path}`);
                const content = yield (0, githubService_1.downloadFileContent)(file.download_url);
                // If the file is long, split it into chunks.
                if (content.split(/\r?\n/).length > 20) {
                    const chunks = chunkContent(content, 20);
                    chunks.forEach((chunk, index) => {
                        // Include file name and chunk number in the title.
                        chunk.title = `${file.path} [Chunk ${index + 1}]`;
                        documents.push(chunk);
                    });
                }
                else {
                    documents.push({
                        title: file.path,
                        content: content,
                    });
                }
            }
            catch (error) {
                console.error(`Error downloading content for ${file.path}:`, error.message);
            }
        }
        console.log(chalk_1.default.green(`Indexed ${documents.length} documents/chunks from ${owner}/${repo}.`));
        // Optionally, save these documents to disk or a database for later reuse.
        // For now, we immediately prompt for a search query.
        const answers = yield inquirer_1.default.prompt([
            { type: 'input', name: 'query', message: 'Enter your search query:' }
        ]);
        console.log(chalk_1.default.blue("Generating RAG response..."));
        const response = yield (0, ragService_1.getRagResponse)(answers.query, documents);
        console.log(chalk_1.default.green('RAG Chat Response:'), response);
    }
    catch (error) {
        console.error(chalk_1.default.red("Error during indexing and RAG chat:"), error.message);
    }
}));
program
    .command('rag <query>')
    .description('Perform a RAG search on previously indexed documents')
    .action((query) => __awaiter(void 0, void 0, void 0, function* () {
    yield authenticate();
    // Here, you might load your pre-indexed documents from storage.
    // For demonstration, we’ll use a dummy in-memory index.
    console.log(chalk_1.default.yellow("No pre-indexed documents available. Please run the 'index' command first."));
}));
program.parse(process.argv);
