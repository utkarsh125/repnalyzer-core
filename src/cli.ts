import { Document, getRagResponse } from './services/ragService';
import { downloadFileContent, fetchRepositoryFilesRecursive } from './services/githubService';

import { Command } from 'commander';
import chalk from 'chalk';
import { connectToDatabase } from './db/database';
import { generateEmbedding } from './services/embeddingService';
import inquirer from 'inquirer';

const program = new Command();

async function authenticate() {
  // Tokens are assumed to be set in the .env file.
  return;
}

/**
 * Splits file content into smaller chunks.
 * You can customize the chunk size (e.g., number of lines per chunk).
 */
function chunkContent(content: string, linesPerChunk: number = 20): Document[] {
  const lines = content.split(/\r?\n/);
  const chunks: Document[] = [];
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
  .action(async (owner: string, repo: string) => {
    await authenticate();
    await connectToDatabase(); // For future expansion; you might later store indexes in a DB.
    try {
      console.log(chalk.blue("Fetching repository files recursively..."));
      const files = await fetchRepositoryFilesRecursive(owner, repo);
      
      // Filter to text files (you can add more sophisticated filtering if needed)
      const textFiles = files.filter(file => {
        // Simple check: file must have a download_url and its extension is not one of the known binary types.
        const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip'];
        return file.download_url && !binaryExtensions.some(ext => file.name.endsWith(ext));
      });
      
      const documents: Document[] = [];
      
      for (const file of textFiles) {
        try {
          console.log(`Downloading content for file: ${file.path}`);
          const content = await downloadFileContent(file.download_url);
          
          // If the file is long, split it into chunks.
          if (content.split(/\r?\n/).length > 20) {
            const chunks = chunkContent(content, 20);
            chunks.forEach((chunk, index) => {
              // Include file name and chunk number in the title.
              chunk.title = `${file.path} [Chunk ${index + 1}]`;
              documents.push(chunk);
            });
          } else {
            documents.push({
              title: file.path,
              content: content,
            });
          }
        } catch (error: any) {
          console.error(`Error downloading content for ${file.path}:`, error.message);
        }
      }
      
      console.log(chalk.green(`Indexed ${documents.length} documents/chunks from ${owner}/${repo}.`));
      
      // Optionally, save these documents to disk or a database for later reuse.
      // For now, we immediately prompt for a search query.
      const answers = await inquirer.prompt([
        { type: 'input', name: 'query', message: 'Enter your search query:' }
      ]);
      
      console.log(chalk.blue("Generating RAG response..."));
      const response = await getRagResponse(answers.query, documents);
      console.log(chalk.green('RAG Chat Response:'), response);
    } catch (error: any) {
      console.error(chalk.red("Error during indexing and RAG chat:"), error.message);
    }
  });

program
  .command('rag <query>')
  .description('Perform a RAG search on previously indexed documents')
  .action(async (query: string) => {
    await authenticate();
    // Here, you might load your pre-indexed documents from storage.
    // For demonstration, we’ll use a dummy in-memory index.
    console.log(chalk.yellow("No pre-indexed documents available. Please run the 'index' command first."));
  });

program.parse(process.argv);
