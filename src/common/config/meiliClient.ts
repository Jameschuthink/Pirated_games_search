import { MeiliSearch } from "meilisearch";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.MEILI_HOST || !process.env.MEILI_API_KEY) {
  throw new Error("Meilisearch credentials missing in .env");
}

export const meiliClient = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_API_KEY,
});

export const INDEX_NAME = process.env.MEILI_INDEX_NAME || "pirated_games";
