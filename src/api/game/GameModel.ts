import { z } from "zod";

// 1. The Core Game Schema - Hybrid approach supporting both URLs and magnets
export const GameSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  webpageUrl: z
    .string()
    .refine((val) => val.startsWith("http") || val.startsWith("magnet:"), {
      message: "webpageUrl must be either a valid HTTP URL or a magnet link",
    }),
  size: z.string().optional(),
  uploadDate: z.string().optional(),
});

// 2. Type Inference
export type Game = z.infer<typeof GameSchema>;

// 3. Validation Schemas for Requests
export const SearchGameSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
  }),
});

export const SyncGameSchema = z.object({
  // No body required for now, but strictly defining it prevents extra fields
  body: z.object({}).strict().optional(),
});
