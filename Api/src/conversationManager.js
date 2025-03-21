import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate, ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { PROMPT_TEMPLATE, PROMPT_TEMPLATE_RESPONSE } from './constants.js';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OllamaEmbeddings } from '@langchain/ollama';
import {
  RunnableSequence,
  RunnablePassthrough,
  RunnableLambda
} from "@langchain/core/runnables";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatGroq } from '@langchain/groq';
import dotenv from 'dotenv';
import { HumanMessagePromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from "@langchain/core/messages";

dotenv.config();

export class ConversationManager {
  constructor() {
    this.conversations = new Map();
    this.chains = new Map();
    this.memories = [];
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

  formatHistory(history) {
    // Para cada turno, converte para duas mensagens (uma do usuário e outra da IA)
    return history.flatMap(turn => [
      new HumanMessage({ content: turn.user }),
      new AIMessage({ content: turn.ai })
    ]);
  }

  async getChainResponse(id) {
    if (this.chains.has(id)) {
        return this.chains.get(id);
    }

    let memory = this.memories
    // if (!memory) {
    //   memory = new BufferMemory({
    //     memoryKey: "history",
    //     returnMessages: true,
    //   });
    //   this.memories.set(id, memory);
    // }

    // Configuração do banco de vetores no PostgreSQL
    const config = {
      postgresConnectionOptions: {
          connectionString: 'postgres://pguser:password@localhost:5450/langchain',
      },
      tableName: "trello_documents",
      columns: {
          idColumnName: "id",
          vectorColumnName: "vector",
          contentColumnName: "content",
          metadataColumnName: "metadata",
      }
    };

    // Configuração dos embeddings
    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text",
      baseUrl: "http://localhost:11434",
      requestOptions: {
          useMmap: true,
          numThread: 6,
          numGpu: 1,
      },
  });
  
    // Inicializando o banco de vetores
    const pgvectorStore = await PGVectorStore.initialize(embeddings, config);

    // const model = new ChatOpenAI({
    //   temperature: 0.0,
    //   modelName: "gpt-3.5-turbo",
    //   openAIApiKey: process.env.OPENAI_API_KEY
    // });

    // Modelo de IA (usando ChatGroq)
    const model = new ChatGroq({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0,
        maxTokens: 1000,
        maxRetries: 3,
        apiKey: process.env.GROQ_API_KEY,
        callbacks: [
            {
                handleLLMNewToken(token) {
                    process.stdout.write(token, 'utf-8');
                },
                handleLLMError(e) {
                    console.error(e);
                },
                handleLLMEnd() {
                    console.log("");
                },
            },
        ],
    });

    // console.log("Prompt criado com sucesso!", message);
    // Criando o prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", PROMPT_TEMPLATE_RESPONSE],
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("Usuário: {question}\n\nDados dos Boards:\n{context}\n\nResposta:")
    ]);
    

    // Criando o retriever com os embeddings
    const retriever = pgvectorStore.asRetriever({ k: 1 });

    const memoryRunnable = new RunnableLambda({
      func: async (input) => {
        // console.log("Input recebido no memoryRunnable:", input);
        // Converte o histórico simples para o formato de BaseMessages
        const formattedHistory = this.formatHistory(this.memories);
        
        // Se input já for um objeto com 'question', apenas adiciona o history formatado
        if (typeof input === "object" && input.question) {
          return { ...input, history: formattedHistory };
        }
        // Caso contrário, encapsula o input em um objeto com 'question'
        return { question: input, history: formattedHistory };
      }
    });
    
  
    const retrieverRunnable = new RunnableLambda({
      func: async (input) => {
        console.log("Input recebido no retriever:", input);
    
        // Garante que passamos apenas `question` como string
        const queryString = typeof input === "object" && input.question 
            ? input.question 
            : String(input);
    
        // console.log("Query enviada para o retriever:", queryString);
    
        const docs = await retriever.getRelevantDocuments(queryString);
        console.log("Documentos retornados pelo retriever:", docs);
    
        if (!Array.isArray(docs)) {
          throw new Error("Retriever retornou um formato inválido.");
        }
    
        // Retorna o input original mesclado com a nova propriedade "context"
        return {
          ...input,
          context: docs.map(doc => doc.pageContent || doc.content || "").join("\n")
        };
      }
    });
    
  
    const chain = RunnableSequence.from([
      retrieverRunnable,
      memoryRunnable,
      prompt,
      model,
    ]);

// const chainWithHistory = new RunnableWithMessageHistory({
//   runnable: chain,
//   getMessageHistory: (sessionId) =>
//     new UpstashRedisChatMessageHistory({
//       sessionId,
//       config: {
//         url: process.env.UPSTASH_REDIS_REST_URL!,
//         token: process.env.UPSTASH_REDIS_REST_TOKEN!,
//       },
//     }),
//   inputMessagesKey: "question",
//   historyMessagesKey: "history",
// });
  

  console.log("Chain criada com sucesso!XSXSXS");
  
    // Armazena a chain na memória para reuso
    this.chains.set(id, chain);
    this.scheduleCleanup(id);

    console.log("Chain criada com sucesso!");
    return chain;
}


  // async getChainResponse(id) {
  //   if (!this.chains.has(id)) {
  //     const memory = new BufferMemory();
  //     const llm = new ChatOpenAI({
  //       temperature: 0.5,
  //       modelName: "gpt-3.5-turbo",
  //       openAIApiKey: process.env.OPENAI_API_KEY
  //     });
  //     const prompt = PromptTemplate.fromTemplate(PROMPT_TEMPLATE_RESPONSE);
  //     const chain = new ConversationChain({
  //       llm,
  //       memory,
  //       prompt
  //     });
  //     this.chains.set(id, chain);
  //     this.scheduleCleanup(id);
  //   }
  //   return this.chains.get(id);
  // }

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
