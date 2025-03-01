import dotenv from 'dotenv';
dotenv.config();

export const config = {
    githubToken: process.env.GITHUB_TOKEN || '',
    cohereApiKey: process.env.COHERE_API_KEY || '',
    databaseUrl: process.env.DATABASE_URL || '', 
}
