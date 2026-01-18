"use client";

import {
  ExternalLink,
  HardDrive,
  Calendar,
  Magnet,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Game, TraditionalGame, GoogleGame } from "@/lib/api";
import { isTraditionalGame } from "@/lib/api";
import { useState } from "react";

interface GameCardProps {
  game: Game;
}

interface MagnetLinkProps {
  uri: string;
  index: number;
}

function MagnetLink({ uri, index }: MagnetLinkProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMagnetClick = () => {
    let opened = false;

    // If the window loses focus, it means the "Open Client?" popup appeared
    const blurHandler = () => {
      opened = true;
      window.removeEventListener("blur", blurHandler);
    };

    window.addEventListener("blur", blurHandler);

    // Try to open the magnet link
    window.open(uri, "_blank", "noopener,noreferrer");

    // Check after 2 seconds if the window is still focused
    setTimeout(() => {
      window.removeEventListener("blur", blurHandler);
      if (!opened) {
        // Show the "You need a torrent manager" panel
        setShowInstructions(true);
      }
    }, 2000);
  };

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(uri)
      .then(() => {
        setCopied(true);
        toast.success("Magnet link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy magnet link");
      });
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleMagnetClick}
        className="w-full gap-1.5 justify-start"
      >
        <Magnet className="h-3.5 w-3.5" />
        <span className="truncate">Magnet Link {index + 1}</span>
      </Button>

      {showInstructions && (
        <div className="p-3 bg-yellow-50/80 border border-yellow-200 rounded-md text-sm">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Nothing happened?</p>
              <p className="text-yellow-700">
                It looks like you don{`'`}t have a torrent client installed.
              </p>
            </div>
          </div>

          <div className="space-y-2 ml-6">
            <div className="flex items-start gap-2">
              <span className="bg-yellow-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                1
              </span>
              <p>
                Download a client like{" "}
                <a
                  href="https://www.qbittorrent.org/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  qBittorrent
                </a>{" "}
                or{" "}
                <a
                  href="https://www.transmissionbt.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Transmission
                </a>
                .
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="bg-yellow-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                2
              </span>
              <p>Install the software and restart your browser.</p>
            </div>

            <div className="flex items-start gap-2">
              <span className="bg-yellow-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                3
              </span>
              <p>Or manually copy the magnet link:</p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyClick}
              className="gap-1.5 ml-6"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copied ? "Copied!" : "Copy Magnet Link"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getSourceColor(source: string): string {
  const lowerSource = source.toLowerCase();
  if (lowerSource.includes("fitgirl")) {
    return "bg-pink-500/20 text-pink-400 border-pink-500/30";
  }
  if (lowerSource.includes("dodi")) {
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  }
  return "bg-primary/20 text-primary border-primary/30";
}

function handleGameClick(game: Game) {
  if (game.webpageUrl) {
    window.open(game.webpageUrl, "_blank", "noopener,noreferrer");
  } else {
    toast.error("Invalid source URL");
  }
}

export function GameCard({ game }: GameCardProps) {
  const isTraditional = isTraditionalGame(game);

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-foreground leading-tight text-balance">
            {game.title}
          </CardTitle>
          <Badge
            variant="outline"
            className={`shrink-0 ${getSourceColor(game.source)}`}
          >
            {game.source}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTraditional ? (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <HardDrive className="h-4 w-4" />
              <span>{(game as TraditionalGame).size}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDate((game as TraditionalGame).uploadDate)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {(game as GoogleGame).snippet}
          </p>
        )}

        {isTraditional && (game as TraditionalGame).uris?.length > 0 && (
          <div className="space-y-3">
            {(game as TraditionalGame).uris.map((uri, index) => (
              <MagnetLink key={index} uri={uri} index={index + 1} />
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleGameClick(game)}
          className="gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Visit Source Page
        </Button>
      </CardContent>
    </Card>
  );
}
