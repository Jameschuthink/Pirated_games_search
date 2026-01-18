import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { GameSchema, SearchGameSchema } from "./GameModel";
import { gameController } from "./GameController";

export const gameRegistry = new OpenAPIRegistry();
export const gameRouter: Router = express.Router();

// 1. Register the Model
gameRegistry.register("Game", GameSchema);

// 2. Register Search Route
gameRegistry.registerPath({
  method: "get",
  path: "/games/search",
  tags: ["Game"],
  request: { query: SearchGameSchema.shape.query },
  responses: createApiResponse(z.array(GameSchema), "Success"),
});

gameRouter.get(
  "/search",
  validateRequest(SearchGameSchema),
  gameController.searchGames,
);

// 3. Register Sync Route
gameRegistry.registerPath({
  method: "post",
  path: "/games/sync",
  tags: ["Game"],
  responses: createApiResponse(z.null(), "Database Synced Successfully"),
});

gameRouter.post("/sync", gameController.syncGames);

// 4. Register Google Search Route
gameRegistry.registerPath({
  method: "get",
  path: "/games/search/google",
  tags: ["Game"],
  request: { query: SearchGameSchema.shape.query },
  responses: createApiResponse(z.array(GameSchema), "Success"),
});

gameRouter.get(
  "/search/google",
  validateRequest(SearchGameSchema),
  gameController.searchGamesFromGoogle,
);
