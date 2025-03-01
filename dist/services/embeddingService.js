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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = generateEmbedding;
exports.cosineSimilarity = cosineSimilarity;
const cohere_ai_1 = require("cohere-ai");
const config_1 = require("../config");
const cohere = new cohere_ai_1.CohereClientV2({
    token: config_1.config.cohereApiKey,
});
/**
 * Generates an embedding vector for the provided text using Cohere's embed API.
 */
function generateEmbedding(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield cohere.embed({
                texts: [text],
                model: "embed-english-v3.0",
                inputType: "search_document",
                embeddingTypes: ["float"] // Using "float" as the default
            });
            // console.log("Cohere embed response:", response);
            // The embeddings are returned under the "float" key.
            if (!response.embeddings ||
                !response.embeddings.float ||
                !Array.isArray(response.embeddings.float) ||
                response.embeddings.float.length === 0) {
                throw new Error("No embeddings returned from Cohere API.");
            }
            const embedding = response.embeddings.float[0];
            if (!embedding || embedding.length === 0) {
                throw new Error("First embedding is undefined or empty.");
            }
            return embedding;
        }
        catch (error) {
            console.error("Error generating embedding:", error.message);
            throw error;
        }
    });
}
/**
 * Computes cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, aVal, i) => sum + aVal * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, aVal) => sum + aVal * aVal, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bVal) => sum + bVal * bVal, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}
