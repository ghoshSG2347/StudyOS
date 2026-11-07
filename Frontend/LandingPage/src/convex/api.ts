/**
 * Frontend-local Convex API shim.
 *
 * This re-exports `api`, `internal`, and `components` using the `convex` package
 * that is installed in this frontend's own node_modules, so that Vite can resolve
 * "convex/server" at build time without crossing directory boundaries into Backend/.
 *
 * The actual function references are resolved at runtime by the Convex client
 * through the VITE_CONVEX_URL endpoint — the shapes declared here are used only
 * for TypeScript type checking.
 */
import { anyApi, componentsGeneric } from "convex/server";

export const api = anyApi;
export const internal = anyApi;
export const components = componentsGeneric();

