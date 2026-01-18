"use client";

import React from "react"

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  isLoading,
  placeholder = "Search for games...",
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSearch();
    }
  };

  return (
    <div className="flex gap-3 w-full max-w-2xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <Button
        onClick={onSearch}
        disabled={!value.trim() || isLoading}
        className="h-12 px-6"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : (
          "Search"
        )}
      </Button>
    </div>
  );
}
