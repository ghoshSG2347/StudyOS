import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();
authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: ["http://localhost:5173", "http://127.0.0.1:5173"],
  },
});
export default http;
