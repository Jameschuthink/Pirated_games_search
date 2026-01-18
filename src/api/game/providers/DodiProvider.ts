import axios from "axios";
import crypto from "crypto";
import type { IGameProvider } from "./IProvider";
import type { Game } from "../GameModel";

export class DodiProvider implements IGameProvider {
  readonly name = "DODI Repacks";
  private readonly url = "https://hydralinks.cloud/sources/dodi.json";

  async fetchGames(): Promise<Game[]> {
    try {
      const response = await axios.get(this.url);

      // HydraLinks for DODI usually uses 'downloads' key
      const data = response.data.downloads;

      if (!Array.isArray(data)) return [];

      return data.map((item: any) => {
        // Simplified approach: Use direct link if available, otherwise use first magnet or search URL
        const pageUrl =
          item.link && item.link.startsWith("http")
            ? item.link
            : (item.uris && item.uris[0]) ||
              `https://dodi-repacks.site/?s=${encodeURIComponent(item.title)}`;

        return {
          id: crypto
            .createHash("md5")
            .update(`dodi-${item.title}`)
            .digest("hex"),
          title: item.title,
          source: "DODI",
          // Use webpageUrl field but allow magnet links as fallback when no HTTP URL available
          webpageUrl: pageUrl,
          size: item.fileSize || "Unknown",
          uploadDate: item.uploadDate,
        };
      });
    } catch (error) {
      console.error(`[DodiProvider] Error fetching data:`, error);
      return [];
    }
  }
}
