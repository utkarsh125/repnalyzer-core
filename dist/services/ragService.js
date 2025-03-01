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
exports.searchRelevantDocuments = searchRelevantDocuments;
exports.getRagResponse = getRagResponse;
const embeddingService_1 = require("./embeddingService");
const cohere_ai_1 = require("cohere-ai");
const config_1 = require("../config");
const cohere = new cohere_ai_1.CohereClientV2({
    token: config_1.config.cohereApiKey,
});
/**
 * For a given query, generate its embedding and compare against each document’s embedding.
 * Returns the top N documents ranked by cosine similarity.
 */
function searchRelevantDocuments(query_1, documents_1) {
    return __awaiter(this, arguments, void 0, function* (query, documents, topN = 3) {
        const queryEmbedding = yield (0, embeddingService_1.generateEmbedding)(query);
        console.log("Query Embedding:", queryEmbedding);
        for (const doc of documents) {
            if (!doc.embedding) {
                console.log(`Generating embedding for document: ${doc.title}`);
                doc.embedding = yield (0, embeddingService_1.generateEmbedding)(doc.content);
                console.log(`Embedding for "${doc.title}":`, doc.embedding);
            }
        }
        const scoredDocs = documents.map(doc => {
            const score = (0, embeddingService_1.cosineSimilarity)(queryEmbedding, doc.embedding);
            return { doc, score };
        });
        scoredDocs.sort((a, b) => b.score - a.score);
        return scoredDocs.slice(0, topN).map(item => item.doc);
    });
}
/**
 * Uses Retrieval Augmented Generation (RAG) to answer a query.
 */
function getRagResponse(query, documents) {
    return __awaiter(this, void 0, void 0, function* () {
        const relevantDocs = yield searchRelevantDocuments(query, documents);
        const context = relevantDocs
            .map(doc => `Title: ${doc.title}\nContent: ${doc.content}`)
            .join("\n\n");
        const prompt = `Using the following context, answer the question below.\n\nContext:\n${context}\n\nQuestion: ${query}\nAnswer:`;
        const response = yield cohere.chat({
            model: 'command-r-plus',
            messages: [
                { role: 'user', content: prompt }
            ],
        });
        return response;
    });
}
