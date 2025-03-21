import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OllamaEmbeddings } from '@langchain/ollama';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { Document } from 'langchain/document';

const loader = new DirectoryLoader(
  "src/data",
  {
    ".txt": (path) => new TextLoader(path),
  }
);

export async function loadDocuments() {
  const documents = await loader.load();

  const boardDelimiter = "[BOARD_END]";

  let boardDocuments = [];
  for (const doc of documents) {
    const boards = doc.pageContent
      .split(boardDelimiter)
      .map(b => b.trim())
      .filter(b => b.length > 0);
      
    for (const boardText of boards) {
      boardDocuments.push(new Document({
        pageContent: boardText,
        metadata: doc.metadata,
      }));
    }
  }

  // const splitter = new TokenTextSplitter({
  //   encodingName: 'cl100k_base',
  //   chunkSize: 600,
  //   chunkOverlap: 0,
  //   separator: boardDelimiter,
  // });

  // const splittedDocuments = await splitter.splitDocuments(documents);

  const config = {
    postgresConnectionOptions: {
      connectionString: 'postgres://pguser:password@localhost:5450/langchain', // Ajuste o nome do usuário e a porta
    },
    tableName: "trello_documents",
    columns: {
      idColumnName: "id",
      vectorColumnName: "vector",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    }
  };

  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434",
    requestOptions: {
      useMmap: true,
      numThread: 6,
      numGpu: 1,
    },

  });

  const pgvectorStore = await PGVectorStore.initialize(
    embeddings,
    config
  );

  const batchSize = 100; // Tamanho do lote

for (let i = 0; i < boardDocuments.length; i += batchSize) {
  const batch = boardDocuments.slice(i, i + batchSize);
  await pgvectorStore.addDocuments(batch);
}

  pgvectorStore.end();
}
