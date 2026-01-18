import { meiliClient, INDEX_NAME } from "@/common/config/meiliClient";
import type { Game } from "./GameModel";

export interface IGameRepository {
  saveBatch(games: Game[]): Promise<void>;
  search(query: string): Promise<Game[]>;
  setupIndex(): Promise<void>;
}

export class GameRepository implements IGameRepository {
  private readonly index = meiliClient.index(INDEX_NAME);

  /**
   * Configures the Meilisearch Cloud index settings.
   * This should be called during application startup or the first sync.
   */
  async setupIndex(): Promise<void> {
    await this.index.updateSettings({
      searchableAttributes: ["title"],
      // Explicitly define what is returned to the frontend
      displayedAttributes: [
        "id",
        "title",
        "source",
        "webpageUrl",
        "size",
        "uploadDate",
      ],
      filterableAttributes: ["source"],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 5,
          twoTypos: 9,
        },
      },
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
      ],
    });
  }

  /**
   * Pushes a batch of games to the Cloud index.
   * Meilisearch uses the 'id' field to handle upserts automatically.
   */
  async saveBatch(games: Game[]): Promise<void> {
    await this.index.updateDocuments(games, { primaryKey: "id" });
  }

  /**
   * Executes a search query against the Cloud index.
   * @param query The search term to look for in game titles
   * @returns Array of games matching the search query
   */
  async search(query: string): Promise<Game[]> {
    const searchRes = await this.index.search(query, {
      limit: 50,
      attributesToRetrieve: [
        "id",
        "title",
        "source",
        "uris",
        "size",
        "uploadDate",
      ],
    });

    return searchRes.hits as Game[];
  }
}
