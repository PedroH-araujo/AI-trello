import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { PROMPT_TEMPLATE } from './constants.js';

export class ConversationManager {
  constructor() {
    this.conversations = new Map();
    this.chains = new Map();
    this.timeout = 30 * 60 * 1000;
  }

  get(id) {
    return this.conversations.get(id);
  }

  set(id, data) {
    this.conversations.set(id, {
      ...data,
      timestamp: Date.now()
    });
    this.scheduleCleanup(id);
  }

  async getChain(id) {
    if (!this.chains.has(id)) {
      const memory = new BufferMemory();
      const llm = new ChatOpenAI({
        temperature: 0.7,
        modelName: "gpt-3.5-turbo",
        openAIApiKey: process.env.OPENAI_API_KEY
      });
      const prompt = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);
      const chain = new ConversationChain({
        llm,
        memory,
        prompt
      });
      this.chains.set(id, chain);
      this.scheduleCleanup(id);
    }
    return this.chains.get(id);
  }

  delete(id) {
    this.conversations.delete(id);
    this.chains.delete(id);
  }

  scheduleCleanup(id) {
    setTimeout(() => {
      const conv = this.get(id);
      if (conv && Date.now() - conv.timestamp > this.timeout) {
        this.delete(id);
      }
    }, this.timeout);
  }
}
