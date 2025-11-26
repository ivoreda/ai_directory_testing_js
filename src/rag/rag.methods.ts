import {ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import {PGVectorStore} from "@langchain/community/vectorstores/pgvector";
import {Document} from "@langchain/core/documents";
import {Client} from "pg";

const llm = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
    // modelName: "",
});

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
})

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ai_directory_demo";

console.log("Using database:", connectionString);
console.log("Using OpenAI key:", process.env.OPENAI_API_KEY);

// we need to get the information that we are embedding from a table in our Postgres database
// then save the embedded vectors back to that table in a vector column
// finally we can use that vector store to perform RAG
// continue working from here
async function initializeVectorStore() {
  const vectorStore = await PGVectorStore.initialize(embeddings, {
    postgresConnectionOptions: {
      connectionString,
    },
    tableName: "documents", // table for storing vectors
    columns: {
      idColumnName: "id",
      vectorColumnName: "embedding",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
  });
  return vectorStore;
}

async function loadDocumentsFromDB(): Promise<Document[]> {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const result = await client.query(
      "SELECT id, content, metadata, embedding FROM documents"
    );

    const docs: Document[] = result.rows.map((row: any) => ({
        pageContent: row.content,
        metadata: 
        {
            id: row.id,
            embedding: row.embedding,
            metadata: row.metadata,
        },
    }));

    return docs;
  } finally {
    await client.end();
  }
}

export async function indexDocuments() {
  console.log("Initializing vector store...");
  const vectorStore = await initializeVectorStore();

  console.log("Loading documents from database...");
  const documents = await loadDocumentsFromDB();

  if (documents.length === 0) {
    console.log("No documents to index");
    return;
  }

  console.log(`Adding ${documents.length} documents to vector store...`);
  await vectorStore.addDocuments(documents);
  console.log("Indexing complete!");
}


async function ragQuery(query: string) {
  console.log(`\nQuery: ${query}\n`);

  // Initialize vector store
  const vectorStore = await initializeVectorStore();

  // Retrieve relevant documents
  const retriever = vectorStore.asRetriever({
    k: 3, // Return top 3 documents
  });

  const relevantDocs = await retriever.invoke(query);

  console.log(`Retrieved ${relevantDocs.length} documents:\n`);
  relevantDocs.forEach((doc, i) => {
    console.log(`[${i + 1}] ${doc.pageContent.substring(0, 200)}...`);
    console.log(`    Source: ${doc.metadata?.source}\n`);
  });

  const context = relevantDocs
    .map((doc) => doc.pageContent)
    .join("\n\n---\n\n");

  const systemPrompt = `You are a helpful assistant. Answer the question based on the provided context. If you don't know the answer, say "I don't know".`;

  const response = await llm.invoke([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion: ${query}`,
    },
  ]);

  console.log("Answer:");
  console.log(response.content);
}

async function incrementalRefresh() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const vectorStore = await initializeVectorStore();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = await client.query(
      "SELECT id, content, metadata, embedding FROM documents WHERE updated_at > $1",
      [oneHourAgo]
    );

    if (result.rows.length === 0) {
      console.log("No new documents to update");
      return;
    }

    console.log(`Updating ${result.rows.length} changed documents...`);

    for (const row of result.rows) {
      await vectorStore.delete({
        filter: { id: row.id },
      });
    }

    const docs = result.rows.map(
      (row: any) =>
        new Document({
          pageContent: row.content,
          metadata: {
            id: row.id,
            embedding: row.embedding,
            metadata: row.metadata,
          },
        })
    );

    await vectorStore.addDocuments(docs);
    console.log("Update complete!");
  } finally {
    await client.end();
  }
}

// Main function execution
async function main() {
  await indexDocuments();
  await ragQuery("How do I configure authentication?");

}

main().catch(console.error);