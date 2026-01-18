"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyncButtonProps {
  onSync: () => void;
  isLoading: boolean;
}

export function SyncButton({ onSync, isLoading }: SyncButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onSync}
      disabled={isLoading}
      className="gap-2 bg-transparent"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Syncing..." : "Sync Database"}
    </Button>
  );
}
