import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Game } from "./GameModel";
import { GameRepository } from "./GameRepository";
import { FitGirlProvider } from "./providers/FitGirlProvider";
import { DodiProvider } from "./providers/DodiProvider";
import { GoogleSearchProvider } from "./providers/GoogleSearchProvider";

export class GameService {
  private gameRepository: GameRepository;
  private traditionalProviders = [new FitGirlProvider(), new DodiProvider()];
  private googleSearchProvider: GoogleSearchProvider;

  constructor(
    repository: GameRepository = new GameRepository(),
    googleProvider: GoogleSearchProvider = new GoogleSearchProvider(),
  ) {
    this.gameRepository = repository;
    this.googleSearchProvider = googleProvider;
  }

  /**
   * Search games using Meilisearch (traditional providers)
   */
  async searchGames(query: string): Promise<ServiceResponse<Game[]>> {
    try {
      const games = await this.gameRepository.search(query);
      return ServiceResponse.success<Game[]>(
        "Games found",
        games,
        StatusCodes.OK,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return ServiceResponse.failure<Game[]>(
        `Failed to search games: ${errorMessage}`,
        [],
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search games using Google Directory (new API)
   */
  async searchGamesFromGoogle(query: string): Promise<ServiceResponse<Game[]>> {
    try {
      const games = await this.googleSearchProvider.fetchFromDirectory(query);

      if (games.length === 0) {
        return ServiceResponse.failure<Game[]>(
          "No games found in Google Directory",
          [],
          StatusCodes.NOT_FOUND,
        );
      }

      return ServiceResponse.success<Game[]>(
        "Games found from Google Directory",
        games,
        StatusCodes.OK,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return ServiceResponse.failure<Game[]>(
        `Google Directory search failed: ${errorMessage}`,
        [],
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Sync database with traditional providers (FitGirl, DODI)
   */
  async syncDatabase(): Promise<ServiceResponse<null>> {
    try {
      const allGames: Game[] = [];
      const results = await Promise.all(
        this.traditionalProviders.map((p) => p.fetchGames()),
      );
      results.forEach((games) => allGames.push(...games));

      if (allGames.length === 0) {
        return ServiceResponse.failure(
          "No games fetched from external providers",
          null,
          StatusCodes.BAD_GATEWAY,
        );
      }

      await this.gameRepository.saveBatch(allGames);

      return ServiceResponse.success(
        `Successfully synced ${allGames.length} games`,
        null,
        StatusCodes.OK,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return ServiceResponse.failure(
        `Sync failed: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const gameService = new GameService();
