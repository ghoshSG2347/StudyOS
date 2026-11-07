import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// All origins that may send auth requests.
// SITE_URL is injected at deploy time via Convex env vars; it covers the
// production Vercel domain. localhost entries cover local dev.
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://studyos-seven-cyan.vercel.app",
  ...(process.env.SITE_URL && process.env.SITE_URL !== "https://studyos-seven-cyan.vercel.app"
    ? [process.env.SITE_URL]
    : []),
];

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins,
  },
});
export default http;
