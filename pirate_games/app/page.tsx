"use client";

import { useState, useCallback } from "react";
import { SearchBar } from "@/components/search-bar";
import { GameList } from "@/components/game-list";
import { SyncButton } from "@/components/sync-button";
import {
  searchMeili,
  searchGoogle,
  syncDatabase,
  type TraditionalGame,
  type GoogleGame,
} from "@/lib/api";
import { Gamepad2, Database, Globe } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SearchType = "meili" | "google";

interface SearchState {
  query: string;
  results: TraditionalGame[] | GoogleGame[];
  isLoading: boolean;
  hasSearched: boolean;
  error: string | null;
}

const initialSearchState: SearchState = {
  query: "",
  results: [],
  isLoading: false,
  hasSearched: false,
  error: null,
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<SearchType>("meili");
  const [isSyncing, setIsSyncing] = useState(false);

  const [meiliState, setMeiliState] = useState<SearchState>(initialSearchState);
  const [googleState, setGoogleState] = useState<SearchState>(initialSearchState);

  const handleMeiliSearch = useCallback(async () => {
    if (!meiliState.query.trim()) return;

    setMeiliState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      hasSearched: true,
    }));

    try {
      const response = await searchMeili(meiliState.query);

      if (response.success) {
        setMeiliState((prev) => ({
          ...prev,
          results: response.responseObject || [],
          isLoading: false,
        }));
      } else {
        setMeiliState((prev) => ({
          ...prev,
          error: response.message || "Search failed",
          results: [],
          isLoading: false,
        }));
      }
    } catch {
      setMeiliState((prev) => ({
        ...prev,
        error: "Failed to connect to server. Please check if the API is running.",
        results: [],
        isLoading: false,
      }));
    }
  }, [meiliState.query]);

  const handleGoogleSearch = useCallback(async () => {
    if (!googleState.query.trim()) return;

    setGoogleState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      hasSearched: true,
    }));

    try {
      const response = await searchGoogle(googleState.query);

      if (response.success) {
        setGoogleState((prev) => ({
          ...prev,
          results: response.responseObject || [],
          isLoading: false,
        }));
      } else {
        setGoogleState((prev) => ({
          ...prev,
          error: response.message || "Google search failed",
          results: [],
          isLoading: false,
        }));
      }
    } catch {
      setGoogleState((prev) => ({
        ...prev,
        error: "Failed to connect to Google search. Please try again.",
        results: [],
        isLoading: false,
      }));
    }
  }, [googleState.query]);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);

    try {
      const response = await syncDatabase();

      if (response.success) {
        toast.success(response.message || "Database synced successfully");
        // Refresh Meilisearch results if we had a previous search
        if (meiliState.hasSearched && meiliState.query.trim()) {
          handleMeiliSearch();
        }
      } else {
        toast.error(response.message || "Failed to sync database");
      }
    } catch {
      toast.error("Failed to connect to server");
    } finally {
      setIsSyncing(false);
    }
  }, [meiliState.hasSearched, meiliState.query, handleMeiliSearch]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Game Search</h1>
          </div>
          <SyncButton onSync={handleSync} isLoading={isSyncing} />
        </header>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as SearchType)}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="meili" className="gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="google" className="gap-2">
              <Globe className="h-4 w-4" />
              Google
            </TabsTrigger>
          </TabsList>

          {/* Meilisearch Tab */}
          <TabsContent value="meili" className="space-y-6">
            <section className="flex justify-center">
              <SearchBar
                value={meiliState.query}
                onChange={(value) =>
                  setMeiliState((prev) => ({ ...prev, query: value }))
                }
                onSearch={handleMeiliSearch}
                isLoading={meiliState.isLoading}
                placeholder="Search database..."
              />
            </section>

            <section>
              <GameList
                games={meiliState.results}
                isLoading={meiliState.isLoading}
                hasSearched={meiliState.hasSearched}
                error={meiliState.error}
                searchType="meili"
              />
            </section>
          </TabsContent>

          {/* Google Tab */}
          <TabsContent value="google" className="space-y-6">
            <section className="flex justify-center">
              <SearchBar
                value={googleState.query}
                onChange={(value) =>
                  setGoogleState((prev) => ({ ...prev, query: value }))
                }
                onSearch={handleGoogleSearch}
                isLoading={googleState.isLoading}
                placeholder="Search Google..."
              />
            </section>

            <section>
              <GameList
                games={googleState.results}
                isLoading={googleState.isLoading}
                hasSearched={googleState.hasSearched}
                error={googleState.error}
                searchType="google"
              />
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
