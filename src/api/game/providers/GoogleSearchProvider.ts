import axios from "axios";
import type { Game } from "../GameModel";

export class GoogleSearchProvider {
  private readonly apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  private readonly cx = process.env.GOOGLE_SEARCH_CX;

  async fetchFromDirectory(query: string): Promise<Game[]> {
    const url = `https://www.googleapis.com/customsearch/v1`;
    try {
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          cx: this.cx,
          q: query,
        },
      });

      const items = response.data.items || [];

      return items.map((item: any) => ({
        title: item.title,
        webpageUrl: item.link,
        source: item.displayLink,
        snippet: item.snippet,
      }));
    } catch (error) {
      console.error("Google Directory API Error:", error);
      return [];
    }
  }
}
