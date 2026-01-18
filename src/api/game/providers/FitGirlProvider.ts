import axios from "axios";
import crypto from "crypto";
import type { IGameProvider } from "./IProvider";
import type { Game } from "../GameModel";

export class FitGirlProvider implements IGameProvider {
  name = "FitGirl Repacks";
  private url = "https://hydralinks.cloud/sources/fitgirl.json";

  async fetchGames(): Promise<Game[]> {
    try {
      const response = await axios.get(this.url);
      const data = response.data.downloads;

      return data.map((item: any) => {
        // Simplified approach: Use direct link if available, otherwise use first magnet or search URL
        const pageUrl =
          item.link && item.link.startsWith("http")
            ? item.link
            : (item.uris && item.uris[0]) ||
              `https://fitgirl-repacks.site/?s=${encodeURIComponent(item.title)}`;

        return {
          id: crypto
            .createHash("md5")
            .update(`fitgirl-${item.title}`)
            .digest("hex"),
          title: item.title,
          source: "FitGirl",
          // Use webpageUrl field but allow magnet links as fallback when no HTTP URL available
          webpageUrl: pageUrl,
          size: item.fileSize || "Unknown",
          uploadDate: item.uploadDate,
        };
      });
    } catch (error) {
      console.error(`Error fetching FitGirl: ${error}`);
      return [];
    }
  }
}
