const API_BASE_URL = "http://localhost:8080";

// Traditional game from Meilisearch
export interface TraditionalGame {
  id: string;
  title: string;
  source: string;
  webpageUrl: string;
  uris: string[];
  size: string;
  uploadDate: string;
}

// Game from Google search
export interface GoogleGame {
  title: string;
  webpageUrl: string;
  source: string;
  snippet: string;
}

// Union type for all game types
export type Game = TraditionalGame | GoogleGame;

// Type guard to check if game is traditional
export function isTraditionalGame(game: Game): game is TraditionalGame {
  return "id" in game && "size" in game && "uploadDate" in game;
}

// Type guard to check if game is from Google
export function isGoogleGame(game: Game): game is GoogleGame {
  return "snippet" in game;
}

export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  responseObject: T | null;
  statusCode: number;
}

export async function searchMeili(
  query: string,
): Promise<ServiceResponse<TraditionalGame[]>> {
  const response = await fetch(
    `${API_BASE_URL}/games/search?q=${encodeURIComponent(query)}`,
  );
  return response.json();
}

export async function searchGoogle(
  query: string,
): Promise<ServiceResponse<GoogleGame[]>> {
  const response = await fetch(
    `${API_BASE_URL}/games/search/google?q=${encodeURIComponent(query)}`,
  );
  return response.json();
}

export async function syncDatabase(): Promise<ServiceResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/games/sync`, {
    method: "POST",
  });
  return response.json();
}
