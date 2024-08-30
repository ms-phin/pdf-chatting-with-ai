import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import pineconeClinet from "./pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

require("dotenv").config();

// const model = new ChatGoogleGenerativeAI({
//   apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "your_google_api_key",
//   model: "gemini-1.5-flash",
// });

export const indexName = "bebiloo";

async function fetchMessagesFromDB(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  console.log("---Fetching chat history from the firestore database ...");

  const chats = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .collection("chat")
    .orderBy("createdAt", "desc")
    .get();
  const chatHistory = chats.docs.map((doc) =>
    doc.data().role === "human"
      ? new HumanMessage(doc.data().message)
      : new AIMessage(doc.data().message)
  );
  console.log(`----fetched last ${chatHistory.length}  messages successfully`);
  return chatHistory;
}

async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
  if (!namespace) throw new Error("No namespace value is provided.");

  // Retrieve the index stats
  const { namespaces } = await index.describeIndexStats();

  // Check if the provided namespace exists in the list of namespaces
  return namespaces?.[namespace] !== undefined;
}

async function generateDocs(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found ");
  }

  console.log("__ Feaching the download URL from Firestore...");

  const firebaseRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();

  const downloadUrl = firebaseRef.data()?.downloadUrl;
  if (!downloadUrl) {
    console.error("Document data:", firebaseRef.data());
    throw new Error("Download URL not found");
  }
  console.log(`___Download URL fetched succsessfully:${downloadUrl} __`);

  // Fetch the PDF from the specified URL

  const response = await fetch(downloadUrl);
  //load the PDF into a PDFDocument object
  const data = await response.blob();

  // Load the PDF document from the specified path
  console.log(" Loading PDF document");
  const loader = new PDFLoader(data);
  const docs = await loader.load();

  //Split the loaded document into smaller part for easier processing
  console.log(" Splitting the document into smaller part...");
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`___Split into ${splitDocs.length} part ___`);

  return splitDocs;
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("user is not found ");
  }

  let pineconeVectorStore;

  // Generate embeddings (numerical representation) for the split documents
  console.log("__Generating embedding...");
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "your_google_api_key",
  });
  const index = pineconeClinet.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    console.log(
      `___ Nmaesaoce ${docId} already exists, reused existign embeddings...__`
    );

    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });
    return pineconeVectorStore;
  } else {
    //If the namespace  does not exis, download the PDF from firesore via the stored Download url  $ generate the embedding and store them in the pinecone vector sore
    const splitDocs = await generateDocs(docId);

    console.log(
      `__ Storing the embedding in namespace ${docId} in the ${indexName} pinecone vectore`
    );

    pineconeVectorStore = await PineconeStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        pineconeIndex: index,
        namespace: docId,
      }
    );
    return pineconeVectorStore;
  }
}

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "your_google_api_key",
  model: "gemini-1.5-flash",
});

const generateLangchainCompletion = async (docId: string, question: string) => {
  let pineconeVectorStore;
  pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);

  if (!pineconeVectorStore) {
    throw new Error("Pinecone vector store not found");
  }
  //Create a  retriver to search through the vecor store
  console.log("__Create a retriever....");
  const retriever = pineconeVectorStore.asRetriever();

  const chatHistory = await fetchMessagesFromDB(docId);

  //Define a propmt template for generating search queries based on conversation history

  console.log("___Defining a prompt template....");

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistory,

    ["user", "{input}"],
    [
      "user",
      "Given the above conversation, generate a search query to look up in order to get information to the conversation   ",
    ],
  ]);
  //Create a history-aware retriver chain that uses the model, retriever, and propmt

  console.log("___ Creating a histroy aware retriever chain");
  const historyAwarRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  //Define a propmt template for answering question based on retrivever context
  console.log("__Defining a propmt template for answering question ");
  const historyAwareRetrieverPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer the user's question based on the the below context:\n\n{context}",
    ],

    ...chatHistory,
    ["user", "{input}"],
  ]);
  //Create a chain to combine the retrieved document into a coherent response
  console.log("____Creating a document combining Chain");
  const histroyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrieverPrompt,
  });

  //Create the main retrieval chain that combine the history-aware retriever ans document combing chain
  const conversarionalRetrievalChain = await createRetrievalChain({
    retriever: historyAwarRetrieverChain,
    combineDocsChain: histroyAwareCombineDocsChain,
  });
  console.log("____Runnig the chain with a sample conversation....");

  const replay = await conversarionalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });
  console.log(replay.answer);
  return replay.answer;
};

export { model, generateLangchainCompletion };
