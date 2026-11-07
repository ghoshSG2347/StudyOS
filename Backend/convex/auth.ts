import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import type { BetterAuthOptions } from "better-auth";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

export const authComponent = createClient<DataModel>(components.betterAuth);
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const siteUrl = process.env.SITE_URL;
  const baseURL = process.env.CONVEX_SITE_URL;
  if (!siteUrl || !baseURL || !process.env.BETTER_AUTH_SECRET) throw new Error("Configure SITE_URL, CONVEX_SITE_URL, and BETTER_AUTH_SECRET in Convex environment variables.");
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return betterAuth({
    appName: "StudyOS",
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: Array.from(new Set([
      siteUrl,
      "https://studyos-seven-cyan.vercel.app",
      "https://studyos-1m0ihti9o-hackathon2348sg-9289.vercel.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ])),
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        const endpoint = process.env.PASSWORD_RESET_WEBHOOK_URL;
        const token = process.env.PASSWORD_RESET_WEBHOOK_TOKEN;
        if (!endpoint || !token) {
          console.error("Password reset requested but mail delivery is not configured.");
          return;
        }
        const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ to: user.email, name: user.name, resetUrl: url }) });
        if (!response.ok) throw new Error("Password reset email delivery failed.");
      },
    },
    ...(googleConfigured ? { socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! } } } : {}),
    plugins: [crossDomain({ siteUrl }), convex({ authConfig })],
  } satisfies BetterAuthOptions);
};
