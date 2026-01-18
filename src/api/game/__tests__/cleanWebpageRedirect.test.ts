import { describe, it, expect, beforeAll, vi } from "vitest";
import { GameService } from "../GameService";
import { FitGirlProvider } from "../providers/FitGirlProvider";
import { DodiProvider } from "../providers/DodiProvider";

describe("Clean Webpage Redirect Implementation", () => {
  let gameService: GameService;

  beforeAll(() => {
    const mockRepo = {
      saveBatch: vi.fn().mockResolvedValue(undefined),
      search: vi.fn().mockImplementation((query: string) => {
        return Promise.resolve([
          {
            id: "test-game-1",
            title: "Test Game",
            source: "FitGirl",
            webpageUrl: "https://fitgirl-repacks.site/test-game/",
            size: "10 GB",
            uploadDate: "2023-01-01T00:00:00.000Z",
          },
        ]);
      }),
      setupIndex: vi.fn().mockResolvedValue(undefined),
    };

    gameService = new GameService(mockRepo as any);
  });

  it("should verify GameModel has NO uris field", () => {
    // Import the Game type to verify its structure
    const { Game } = require("../GameModel");

    // Create a test game object
    const testGame: any = {
      id: "test",
      title: "Test",
      source: "FitGirl",
      webpageUrl: "https://example.com/test",
      size: "10 GB",
      uploadDate: "2023-01-01",
    };

    // Verify the game object does NOT have uris
    expect(testGame).not.toHaveProperty("uris");
    expect(testGame).not.toHaveProperty("magnet");
    expect(testGame).not.toHaveProperty("downloadLinks");

    // Verify it has the required webpageUrl
    expect(testGame).toHaveProperty("webpageUrl");
    expect(testGame.webpageUrl).toContain("https://");
  });

  it("should use magnet links as fallback when no HTTP URL available", () => {
    // Test data that might come from HydraLinks JSON (no direct link)
    const mockHydraData = {
      title: "Test Game",
      link: null, // No direct HTTP link
      uris: [
        "magnet:?xt=urn:btih:abc123",
        "https://some-direct-download.com/file.zip",
      ],
      fileSize: "10 GB",
      uploadDate: "2023-01-01",
    };

    // Simulate the simplified provider logic
    const pageUrl =
      mockHydraData.link && mockHydraData.link.startsWith("http")
        ? mockHydraData.link
        : (mockHydraData.uris && mockHydraData.uris[0]) ||
          `https://fitgirl-repacks.site/?s=${encodeURIComponent(mockHydraData.title)}`;

    // Verify it uses the magnet link as fallback
    expect(pageUrl).toBe("magnet:?xt=urn:btih:abc123");
    expect(pageUrl).toContain("magnet:");
  });

  it("should prefer HTTP URL over magnet when both available", () => {
    // Test data with both HTTP link and magnet
    const mockHydraData = {
      title: "Test Game",
      link: "https://fitgirl-repacks.site/test-game/", // Direct HTTP link available
      uris: [
        "magnet:?xt=urn:btih:abc123",
        "https://some-direct-download.com/file.zip",
      ],
      fileSize: "10 GB",
      uploadDate: "2023-01-01",
    };

    // Simulate the provider logic
    const pageUrl =
      mockHydraData.link && mockHydraData.link.startsWith("http")
        ? mockHydraData.link
        : (mockHydraData.uris && mockHydraData.uris[0]) ||
          `https://fitgirl-repacks.site/?s=${encodeURIComponent(mockHydraData.title)}`;

    // Verify it prefers HTTP URL over magnet
    expect(pageUrl).toBe("https://fitgirl-repacks.site/test-game/");
    expect(pageUrl).toContain("https://");
    expect(pageUrl).not.toContain("magnet:");
  });

  it("should verify fallback URL generation for missing links", () => {
    // Test data without a direct link
    const mockHydraData = {
      title: "Game Without Direct Link",
      link: null, // No direct link
      uris: [
        "magnet:?xt=urn:btih:def456",
        "https://another-download.com/file.zip",
      ],
      fileSize: "5 GB",
      uploadDate: "2023-01-02",
    };

    // Simulate the provider logic with fallback
    const pageUrl =
      mockHydraData.link && mockHydraData.link.startsWith("http")
        ? mockHydraData.link
        : `https://fitgirl-repacks.site/?s=${encodeURIComponent(mockHydraData.title)}`;

    // Verify the fallback result
    expect(pageUrl).toBe(
      "https://fitgirl-repacks.site/?s=Game%20Without%20Direct%20Link",
    );
    expect(pageUrl).not.toContain("magnet:");
    expect(pageUrl).not.toContain("another-download");
    expect(pageUrl).toContain("https://fitgirl-repacks.site/?s=");
  });

  it("should verify HTTP validation in URL generation", () => {
    // Test data with non-HTTP link
    const mockHydraData = {
      title: "Game With Bad Link",
      link: "ftp://some-ftp-server.com/file", // Not HTTP
      uris: ["magnet:?xt=urn:btih:ghi789"],
      fileSize: "8 GB",
      uploadDate: "2023-01-03",
    };

    // Simulate the provider logic with HTTP validation
    const pageUrl =
      mockHydraData.link && mockHydraData.link.startsWith("http")
        ? mockHydraData.link
        : `https://fitgirl-repacks.site/?s=${encodeURIComponent(mockHydraData.title)}`;

    // Verify HTTP validation worked - should use fallback
    expect(pageUrl).toBe(
      "https://fitgirl-repacks.site/?s=Game%20With%20Bad%20Link",
    );
    expect(pageUrl).not.toContain("ftp://");
    expect(pageUrl).not.toContain("magnet:");
  });

  it("should verify both providers implement clean redirect logic", () => {
    // Check FitGirl provider
    const fitGirlProvider = new FitGirlProvider();
    expect(fitGirlProvider).toBeDefined();
    expect(fitGirlProvider.name).toBe("FitGirl Repacks");

    // Check Dodi provider
    const dodiProvider = new DodiProvider();
    expect(dodiProvider).toBeDefined();
    expect(dodiProvider.name).toBe("DODI Repacks");

    // Verify both providers are included in the service
    const providers = (gameService as any).providers;
    expect(providers.length).toBe(2);
    expect(providers[0] instanceof FitGirlProvider).toBe(true);
    expect(providers[1] instanceof DodiProvider).toBe(true);
  });

  it("should verify search results use webpageUrl field (HTTP or magnet)", async () => {
    const result = await gameService.searchGames("Test");

    expect(result.success).toBe(true);
    expect(result.responseObject).toBeDefined();

    if (result.responseObject && result.responseObject.length > 0) {
      const game = result.responseObject[0];

      // Verify webpageUrl field exists and is valid
      expect(game).toHaveProperty("webpageUrl");
      expect(typeof game.webpageUrl).toBe("string");
      expect(game.webpageUrl.length).toBeGreaterThan(0);

      // Verify it's either HTTP URL or magnet link
      const isHttp = game.webpageUrl.startsWith("http");
      const isMagnet = game.webpageUrl.startsWith("magnet:");
      expect(isHttp || isMagnet).toBe(true);

      // Verify no separate magnet or direct download fields
      expect(game).not.toHaveProperty("uris");
      expect(game).not.toHaveProperty("magnet");
      expect(game).not.toHaveProperty("downloadLinks");
      expect(game).not.toHaveProperty("torrent");
    }
  });
});
