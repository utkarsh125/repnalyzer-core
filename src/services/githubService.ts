import axios from 'axios';
import { config } from "../config";

/**
 * Recursively fetches all files from a GitHub repository starting at a given path.
 *
 * @param owner - GitHub username or organization.
 * @param repo - Repository name.
 * @param path - The path to start from (default is the repository root).
 * @returns An array of file objects.
 */
export async function fetchRepositoryFilesRecursive(
  owner: string,
  repo: string,
  path: string = ""
): Promise<any[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `token ${config.githubToken}`,
    },
  });
  const items = response.data;
  let files: any[] = [];
  for (const item of items) {
    if (item.type === 'dir') {
      const subFiles = await fetchRepositoryFilesRecursive(owner, repo, item.path);
      files = files.concat(subFiles);
    } else if (item.type === 'file') {
      files.push(item);
    }
  }
  return files;
}

/**
 * Downloads file content given a download URL.
 *
 * @param url - The download URL for the file.
 * @returns The text content of the file.
 */
export async function downloadFileContent(url: string): Promise<string> {
  const response = await axios.get(url);
  return response.data;
}
