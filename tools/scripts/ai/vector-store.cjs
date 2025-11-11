#!/usr/bin/env node
/**
 * Vector Store for Semantic Code Search
 * Uses Qdrant for blazing-fast similarity search
 * Based on proven patterns from @qdrant/js-client and langchain
 */

const fs = require("fs");
const path = require("path");

const { QdrantClient } = require("@qdrant/js-client-rest");

const COLLECTION_NAME = "codebase-vectors";
const VECTOR_SIZE = 1536; // OpenAI ada-002 embedding size

class VectorStore {
  constructor() {
    // In-memory mode for development, can switch to persistent later
    this.client = new QdrantClient({ url: "http://localhost:6333" });
    this.initialized = false;
  }

  /**
   * Initialize vector collection
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

      if (!exists) {
        // Create collection with optimized settings
        await this.client.createCollection(COLLECTION_NAME, {
          vectors: {
            size: VECTOR_SIZE,
            distance: "Cosine", // Best for code similarity
            on_disk: false, // Keep in RAM for speed
          },
          optimizers_config: {
            indexing_threshold: 10000, // Start indexing after 10k vectors
          },
          hnsw_config: {
            m: 16, // Number of edges per node (balance accuracy/speed)
            ef_construct: 100, // Higher = more accurate index
            full_scan_threshold: 10000,
          },
        });
        console.log("✅ Vector collection created");
      }

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize vector store:", error.message);
      // Fall back to non-vector search if Qdrant unavailable
      this.initialized = false;
    }
  }

  /**
   * Add code/document vectors to the store
   * @param {Array} items - [{id, text, metadata, vector}]
   */
  async addVectors(items) {
    if (!this.initialized) await this.initialize();
    if (!this.initialized) {
      console.warn("Vector store not available, skipping...");
      return;
    }

    const points = items.map((item, idx) => ({
      id: item.id || idx,
      vector: item.vector,
      payload: {
        text: item.text,
        file: item.metadata?.file,
        type: item.metadata?.type || "code",
        language: item.metadata?.language,
        timestamp: Date.now(),
      },
    }));

    await this.client.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });
  }

  /**
   * Semantic search for similar code/docs
   * @param {Array} queryVector - Embedding of search query
   * @param {Object} options - {limit, filter}
   */
  async search(queryVector, options = {}) {
    if (!this.initialized) await this.initialize();
    if (!this.initialized) return [];

    const results = await this.client.search(COLLECTION_NAME, {
      vector: queryVector,
      limit: options.limit || 10,
      filter: options.filter,
      with_payload: true,
      with_vector: false, // Don't return vectors to save bandwidth
      score_threshold: options.scoreThreshold || 0.7, // Only return good matches
    });

    return results.map((r) => ({
      id: r.id,
      score: r.score,
      text: r.payload.text,
      file: r.payload.file,
      type: r.payload.type,
      language: r.payload.language,
    }));
  }

  /**
   * Hybrid search: combine vector similarity + text filtering
   */
  async hybridSearch(queryVector, textQuery, options = {}) {
    if (!this.initialized) await this.initialize();
    if (!this.initialized) return [];

    // Qdrant filter for text matching
    const filter = {
      must: [
        {
          key: "text",
          match: { text: textQuery },
        },
      ],
    };

    return this.search(queryVector, { ...options, filter });
  }

  /**
   * Find similar code snippets
   */
  async findSimilarCode(codeVector, language = null, limit = 5) {
    const filter = language
      ? {
          must: [{ key: "language", match: { value: language } }],
        }
      : null;

    return this.search(codeVector, { limit, filter, scoreThreshold: 0.75 });
  }

  /**
   * Get collection stats
   */
  async getStats() {
    if (!this.initialized) return { available: false };

    const info = await this.client.getCollection(COLLECTION_NAME);
    return {
      available: true,
      vectorCount: info.points_count,
      segments: info.segments_count,
      indexedVectors: info.indexed_vectors_count,
    };
  }
}

// Singleton instance
const vectorStore = new VectorStore();

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  async function main() {
    switch (command) {
      case "init":
        await vectorStore.initialize();
        console.log("✅ Vector store initialized");
        break;

      case "stats": {
        const stats = await vectorStore.getStats();
        console.log("📊 Vector Store Stats:", JSON.stringify(stats, null, 2));
        break;
      }

      default:
        console.log("Usage: node vector-store.cjs <init|stats>");
    }
  }

  main().catch(console.error);
}

module.exports = vectorStore;
