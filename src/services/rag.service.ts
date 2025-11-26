import {ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import {PGVectorStore} from "@langchain/community/vectorstores/pgvector";
import {Document} from "@langchain/core/documents";
import type { ToolDto } from "../dtos/tool.dto";
import { tool } from "@langchain/core/tools";

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
});

const connectionString = process.env.DATABASE_URL;

async function initializeVectorStore() {
  const vectorStore = await PGVectorStore.initialize(embeddings, {
    postgresConnectionOptions: {
      connectionString,
    },
    tableName: "tool_embeddings",
    columns: {
      vectorColumnName: "embedding",
      contentColumnName: "content",
      metadataColumnName: "metadata",
      idColumnName: "id",
    },
  });
  return vectorStore;
}

// import { ToolService } from "../services/tool.service";

// const toolService = new ToolService();
export class RagService {
  async embedNewTool(toolData: ToolDto) {
    console.log("Embedding new tool:", toolData);
    const vectorStore = await initializeVectorStore();

    const tags = Array.isArray(toolData.tags) ? toolData.tags : [];
    const pageContent = [
      toolData.name,
      toolData.description,
      toolData.url,
      toolData.category,
      tags.join(", "),
      toolData.pricing,
    ].filter(Boolean).join("\n\n");

    const doc = new Document({
        pageContent: pageContent,
        metadata: {
            id: toolData.id,
            name: toolData.name ?? null,
            url: toolData.url ?? null,
            category: toolData.category ?? null,
            tags: tags ?? null,
            pricing: toolData.pricing ?? null,
        },
        id: toolData.id,
    });

    console.log("here now")
    console.log("doc", doc)

    await vectorStore.addDocuments([doc]);


    // cant call this because db will through isembedded is not in table
    // let pgvectorstore handle it
    // but will not mark isEmbedded in tools table
    // await toolService.markToolAsEmbedded(toolData.id);
    console.log("Tool embedded successfully");
  }
}

export const ragService = new RagService();
