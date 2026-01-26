import { ConvexHttpClient } from "convex/browser";

let convexClient: ConvexHttpClient | null = null;

export function getConvexClient() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("❌ Missing CONVEX_URL environment variable");
  }

  if (!convexClient) {
    convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  }

  return convexClient;
}
