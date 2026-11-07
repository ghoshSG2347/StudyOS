import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();
const siteUrl = process.env.SITE_URL;
const allowedOrigins = Array.from(new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(siteUrl ? [siteUrl] : []),
]));

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins,
  },
});
export default http;
