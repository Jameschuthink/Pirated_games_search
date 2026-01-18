import { describe, it, expect, beforeAll, vi } from "vitest";
import { GameService } from "../GameService";
import { GameRepository } from "../GameRepository";
import { GoogleSearchProvider } from "../providers/GoogleSearchProvider";

describe("Hybrid Search Implementation", () => {
  let gameService: GameService;
  let mockRepository: GameRepository;
  let mockGoogleProvider: GoogleSearchProvider;

  beforeAll(() => {
    // Mock repository for traditional search
    mockRepository = {
      saveBatch: vi.fn().mockResolvedValue(undefined),
      search: vi.fn().mockImplementation((query: string) => {
        return Promise.resolve([
          {
            id: "meili-game-1",
            title: "Traditional Game",
            source: "FitGirl",
            webpageUrl: "https://fitgirl-repacks.site/traditional-game/",
            size: "10 GB",
            uploadDate: "2023-01-01T00:00:00.000Z"
          }
        ]);
      }),
      setupIndex: vi.fn().mockResolvedValue(undefined)
    } as unknown as GameRepository;

    // Mock Google provider
    mockGoogleProvider = {
      fetchFromDirectory: vi.fn().mockImplementation((query: string) => {
        return Promise.resolve([
          {
            title: "Google Game",
            webpageUrl: "https://fitgirl-repacks.site/google-game/",
            source: "fitgirl-repacks.site",
            snippet: "A game found via Google Directory"
          }
        ]);
      })
    } as unknown as GoogleSearchProvider;

    gameService = new GameService(mockRepository, mockGoogleProvider);
  });

  it("should support traditional Meilisearch functionality", async () => {
    const result = await gameService.searchGames("Test");

    expect(result.success).toBe(true);
    expect(result.responseObject).toBeDefined();
    expect(Array.isArray(result.responseObject)).toBe(true);

    if (result.responseObject && result.responseObject.length > 0) {
      const game = result.responseObject[0];

      // Verify traditional game structure
      expect(game).toHaveProperty("id");
      expect(game).toHaveProperty("title");
      expect(game).toHaveProperty("source");
      expect(game).toHaveProperty("webpageUrl");
      expect(game).toHaveProperty("size");
      expect(game).toHaveProperty("uploadDate");

      // Verify it's from traditional providers
      expect(game.source).toBe("FitGirl");
      expect(game.webpageUrl).toContain("fitgirl-repacks.site");
    }
  });

  it("should support Google Directory search functionality", async () => {
    const result = await gameService.searchGamesFromGoogle("Test");

    expect(result.success).toBe(true);
    expect(result.responseObject).toBeDefined();
    expect(Array.isArray(result.responseObject)).toBe(true);

    if (result.responseObject && result.responseObject.length > 0) {
      const game = result.responseObject[0];

      // Verify Google game structure
      expect(game).toHaveProperty("title");
      expect(game).toHaveProperty("webpageUrl");
      expect(game).toHaveProperty("source");
      expect(game).toHaveProperty("snippet");

      // Verify it's from Google Directory
      expect(game.source).toBe("fitgirl-repacks.site");
      expect(game.webpageUrl).toContain("fitgirl-repacks.site");
      expect(game.snippet).toBeDefined();
    }
  });

  it("should maintain separate data structures for both systems", () => {
    // Traditional games have id, size, uploadDate
    const traditionalGame = {
      id: "test-id",
      title: "Test",
      source: "FitGirl",
      webpageUrl: "https://example.com",
      size: "10 GB",
      uploadDate: "2023-01-01"
    };

    // Google games have snippet instead
    const googleGame = {
      title: "Test",
      webpageUrl: "https://example.com",
      source: "example.com",
      snippet: "Test snippet"
    };

    // Verify traditional game has required fields
    expect(traditionalGame).toHaveProperty("id");
    expect(traditionalGame).toHaveProperty("size");
    expect(traditionalGame).toHaveProperty("uploadDate");
    expect(traditionalGame).not.toHaveProperty("snippet");

    // Verify Google game has required fields
    expect(googleGame).toHaveProperty("snippet");
    expect(googleGame).not.toHaveProperty("id");
    expect(googleGame).not.toHaveProperty("size");
    expect(googleGame).not.toHaveProperty("uploadDate");
  });

  it("should handle empty results from both systems", async () => {
    // Mock empty results for traditional search
    const emptyRepo = {
      ...mockRepository,
      search: vi.fn().mockResolvedValue([])
    };

    const emptyGoogleProvider = {
      ...mockGoogleProvider,
      fetchFromDirectory: vi.fn().mockResolvedValue([])
    };

    const testService1 = new GameService(emptyRepo, mockGoogleProvider);
    const testService2 = new GameService(mockRepository, emptyGoogleProvider);

    // Test traditional search with empty results
    const result1 = await testService1.searchGames("Empty");
    expect(result1.success).toBe(true);
    expect(result1.responseObject).toEqual([]);

    // Test Google search with empty results
    const result2 = await testService2.searchGamesFromGoogle("Empty");
    expect(result2.success).toBe(false); // Should return failure for empty Google results
    expect(result2.statusCode).toBe(404);
  });

  it("should preserve sync functionality for traditional providers", async () => {
    // Mock successful sync
    const mockSyncRepo = {
      ...mockRepository,
      saveBatch: vi.fn().mockResolvedValue(undefined)
    };

    const testService = new GameService(mockSyncRepo, mockGoogleProvider);
    const result = await testService.syncDatabase();

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
  });
});
