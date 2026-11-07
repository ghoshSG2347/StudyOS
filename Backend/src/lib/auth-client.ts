import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";

const baseURL = import.meta.env.VITE_CONVEX_SITE_URL;
if (!baseURL) throw new Error("VITE_CONVEX_SITE_URL must be configured.");
export const authClient = createAuthClient({ baseURL, plugins: [convexClient(), crossDomainClient()] });
