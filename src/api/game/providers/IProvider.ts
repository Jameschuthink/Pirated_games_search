import type { Game } from "../GameModel";

export interface IGameProvider {
  name: string;
  fetchGames(): Promise<Game[]>;
}
