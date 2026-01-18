"use client";

import { GameCard } from "@/components/game-card";
import type { Game } from "@/lib/api";
import { isTraditionalGame } from "@/lib/api";
import { Gamepad2, Search } from "lucide-react";

interface GameListProps {
  games: Game[];
  isLoading: boolean;
  hasSearched: boolean;
  error: string | null;
  searchType: "meili" | "google";
}

export function GameList({
  games,
  isLoading,
  hasSearched,
  error,
  searchType,
}: GameListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
        <p>
          {searchType === "meili"
            ? "Searching database..."
            : "Searching Google..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-destructive">
        <p className="text-lg font-medium mb-2">Error</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Gamepad2 className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg">Search for games to get started</p>
        <p className="text-sm mt-1">
          Use the search bar above to find games
        </p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Search className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg">No games found</p>
        <p className="text-sm mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {games.length} {games.length === 1 ? "game" : "games"}
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game, index) => (
          <GameCard
            key={isTraditionalGame(game) ? game.id : `${game.title}-${index}`}
            game={game}
          />
        ))}
      </div>
    </div>
  );
}
