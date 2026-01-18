import type { Request, RequestHandler, Response } from "express";
import { gameService } from "./GameService";

class GameController {
  public searchGames: RequestHandler = async (req: Request, res: Response) => {
    // Zod validation middleware guarantees req.query.q exists
    const query = req.query.q as string;
    const serviceResponse = await gameService.searchGames(query);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public syncGames: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await gameService.syncDatabase();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public searchGamesFromGoogle: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    // Zod validation middleware guarantees req.query.q exists
    const query = req.query.q as string;
    const serviceResponse = await gameService.searchGamesFromGoogle(query);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const gameController = new GameController();
