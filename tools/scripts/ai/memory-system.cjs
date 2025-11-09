#!/usr/bin/env node
/**
 * LangChain-inspired Memory System
 * Provides conversation context and RAG capabilities
 * Patterns from langchain-ai/langchainjs proven at scale
 */

const vectorStore = require("./vector-store.cjs");

class AIMemory {
  constructor(options = {}) {
    this.memoryKey = options.memoryKey || "history";
    this.maxMessages = options.maxMessages || 10;
    this.vectorEnabled = options.vectorEnabled !== false;
    this.messages = [];
  }

  /**
   * Save interaction context (input + output)
   */
  async saveContext(input, output) {
    const entry = {
      input,
      output,
      timestamp: Date.now(),
    };

    this.messages.push(entry);

    // Keep only recent messages (LRU-style)
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    // Save to vector store for semantic retrieval
    if (this.vectorEnabled && input.vector) {
      await vectorStore.addVectors([
        {
          text: `Q: ${input.question}\nA: ${output.answer}`,
          vector: input.vector,
          metadata: {
            type: "conversation",
            timestamp: Date.now(),
          },
        },
      ]);
    }
  }

  /**
   * Load relevant memory based on current query
   */
  async loadMemoryVariables(query, queryVector = null) {
    let context = "";

    // Add recent conversation history
    const recentHistory = this.messages
      .slice(-5)
      .map((m) => `Human: ${m.input.question}\nAI: ${m.output.answer}`)
      .join("\n\n");

    context += recentHistory;

    // Add semantically similar past conversations if vectors enabled
    if (this.vectorEnabled && queryVector) {
      const similarConversations = await vectorStore.search(queryVector, {
        limit: 3,
        filter: {
          must: [{ key: "type", match: { value: "conversation" } }],
        },
      });

      if (similarConversations.length > 0) {
        context += "\n\nRelevant past conversations:\n";
        context += similarConversations.map((c) => c.text).join("\n\n");
      }
    }

    return {
      [this.memoryKey]: context,
    };
  }

  /**
   * Clear memory
   */
  clear() {
    this.messages = [];
  }

  /**
   * Get memory summary
   */
  summary() {
    return {
      messageCount: this.messages.length,
      oldestMessage: this.messages[0]?.timestamp,
      newestMessage: this.messages[this.messages.length - 1]?.timestamp,
    };
  }
}

/**
 * Vector Store Retriever Memory (RAG pattern)
 * Retrieves relevant documents from vector store based on query
 */
class VectorStoreRetrieverMemory {
  constructor(options = {}) {
    this.memoryKey = options.memoryKey || "context";
    this.returnDocs = options.returnDocs || false;
    this.k = options.k || 4; // Number of docs to retrieve
  }

  /**
   * Retrieve relevant documents for query
   */
  async loadMemoryVariables(queryVector, options = {}) {
    const docs = await vectorStore.search(queryVector, {
      limit: this.k,
      scoreThreshold: options.scoreThreshold || 0.7,
    });

    if (this.returnDocs) {
      return { [this.memoryKey]: docs };
    }

    // Format as string context
    const context = docs.map((doc, i) => `[${i + 1}] ${doc.text}`).join("\n\n");

    return { [this.memoryKey]: context };
  }

  /**
   * Add document to retriever
   */
  async saveContext(doc, vector) {
    await vectorStore.addVectors([
      {
        text: doc.text,
        vector,
        metadata: doc.metadata || {},
      },
    ]);
  }
}

/**
 * Combined Memory - Mix conversation history + document retrieval
 */
class CombinedMemory {
  constructor(options = {}) {
    this.conversationMemory = new AIMemory(options.conversation || {});
    this.documentMemory = new VectorStoreRetrieverMemory(options.retriever || {});
  }

  async loadMemoryVariables(query, queryVector) {
    const [conversation, documents] = await Promise.all([
      this.conversationMemory.loadMemoryVariables(query, queryVector),
      this.documentMemory.loadMemoryVariables(queryVector),
    ]);

    return {
      ...conversation,
      ...documents,
    };
  }

  async saveContext(input, output) {
    await this.conversationMemory.saveContext(input, output);
  }
}

module.exports = {
  AIMemory,
  VectorStoreRetrieverMemory,
  CombinedMemory,
};
