import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";


// Use absolute path for .env


const PINECONE_API_KEY ="pcsk_5qP9uQ_LJrjeYoz8xuPLSxueYYZ5R8SBz27LJaZJriELDHU3neQHRcP7b9S7pCA9jxsC4"
const INDEX_NAME = "devcollab-matching";

async function main() {
  try {
    const client = new Pinecone({ apiKey: PINECONE_API_KEY });
     const indexes = await client.listIndexes();
    console.log("Available indexes:", indexes);

    // Fix: Access the indexes array inside the returned object
    const indexArray = Array.isArray(indexes.indexes) ? indexes.indexes : [];
    const existingIndex = indexArray.find((idx: any) => idx.name === INDEX_NAME);

    if (!existingIndex) {
      console.error(`Index "${INDEX_NAME}" does NOT exist!`);
      process.exit(1);
    } else {
      console.log(`Index "${INDEX_NAME}" exists.`);
    }

    // Optionally, describe index stats
    const index = client.index(INDEX_NAME);
    const stats = await index.describeIndexStats();
    console.log("Index stats:", stats);
 

    process.exit(0);
  } catch (err) {
    console.error("Error during Pinecone test:", err);
    process.exit(1);
  }
}

main();