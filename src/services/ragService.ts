import { cosineSimilarity, generateEmbedding } from "./embeddingService";

import { CohereClientV2 } from "cohere-ai";
import { config } from "../config";

const cohere = new CohereClientV2({
  token: config.cohereApiKey,
});

export interface Document {
  title: string;
  content: string;
  embedding?: number[];
}

export async function searchRelevantDocuments(
  query: string,
  documents: Document[],
  topN: number = 3
): Promise<Document[]> {
  const queryEmbedding = await generateEmbedding(query);
  console.log("Query Embedding:", queryEmbedding);

  // Generate embedding for each document if not already computed
  for (const doc of documents) {
    if (!doc.embedding) {
      console.log(`Generating embedding for document: ${doc.title}`);
      doc.embedding = await generateEmbedding(doc.content);
      console.log(`Embedding for "${doc.title}":`, doc.embedding);
    }
  }

  // Compute similarity scores
  const scoredDocs = documents.map(doc => {
    const score = cosineSimilarity(queryEmbedding, doc.embedding!);
    return { doc, score };
  });

  // Sort and return top N
  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.slice(0, topN).map(item => item.doc);
}

export async function getRagResponse(query: string, documents: Document[]): Promise<any> {
  // Retrieve the top relevant documents
  const relevantDocs = await searchRelevantDocuments(query, documents);
  
  // Construct a detailed prompt that clearly separates context from the query
  const context = relevantDocs
    .map(doc => `Title: ${doc.title}\nContent: ${doc.content}`)
    .join("\n\n");
    
  const prompt = `Based on the following repository content, answer the question below.
  
Context:
${context}
  
Question: ${query}
  
Answer:`;
  
  console.log("Final Prompt Sent to Cohere Chat API:\n", prompt);
  
  // Send the prompt to Cohere's chat API
  const response = await cohere.chat({
    model: 'command-r-plus',
    messages: [{ role: 'user', content: prompt }],
  });
  return response;
}
