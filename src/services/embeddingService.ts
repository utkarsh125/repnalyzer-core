import { CohereClientV2 } from "cohere-ai";
import { config } from "../config";

const cohere = new CohereClientV2({
  token: config.cohereApiKey,
});

/**
 * Generates an embedding vector for the provided text using Cohere's embed API.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await cohere.embed({
      texts: [text],
      model: "embed-english-v3.0",
      inputType: "search_document",
      embeddingTypes: ["float"]  // Using "float" as the default
    });
    
    // console.log("Cohere embed response:", response);
    
    // The embeddings are returned under the "float" key.
    if (
      !response.embeddings ||
      !response.embeddings.float ||
      !Array.isArray(response.embeddings.float) ||
      response.embeddings.float.length === 0
    ) {
      throw new Error("No embeddings returned from Cohere API.");
    }
    
    const embedding = response.embeddings.float[0];
    if (!embedding || embedding.length === 0) {
      throw new Error("First embedding is undefined or empty.");
    }
    return embedding;
  } catch (error: any) {
    console.error("Error generating embedding:", error.message);
    throw error;
  }
}

/**
 * Computes cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, aVal, i) => sum + aVal * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, aVal) => sum + aVal * aVal, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bVal) => sum + bVal * bVal, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
