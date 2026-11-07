/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_syllabusParser_classifier from "../lib/syllabusParser/classifier.js";
import type * as lib_syllabusParser_courseDetector from "../lib/syllabusParser/courseDetector.js";
import type * as lib_syllabusParser_hierarchyBuilder from "../lib/syllabusParser/hierarchyBuilder.js";
import type * as lib_syllabusParser_index from "../lib/syllabusParser/index.js";
import type * as lib_syllabusParser_normalizer from "../lib/syllabusParser/normalizer.js";
import type * as lib_syllabusParser_pdfExtractor from "../lib/syllabusParser/pdfExtractor.js";
import type * as lib_syllabusParser_types from "../lib/syllabusParser/types.js";
import type * as lib_tree from "../lib/tree.js";
import type * as lib_validators from "../lib/validators.js";
import type * as library from "../library.js";
import type * as materials from "../materials.js";
import type * as nodes from "../nodes.js";
import type * as notes from "../notes.js";
import type * as preferences from "../preferences.js";
import type * as profiles from "../profiles.js";
import type * as syllabuses from "../syllabuses.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/syllabusParser/classifier": typeof lib_syllabusParser_classifier;
  "lib/syllabusParser/courseDetector": typeof lib_syllabusParser_courseDetector;
  "lib/syllabusParser/hierarchyBuilder": typeof lib_syllabusParser_hierarchyBuilder;
  "lib/syllabusParser/index": typeof lib_syllabusParser_index;
  "lib/syllabusParser/normalizer": typeof lib_syllabusParser_normalizer;
  "lib/syllabusParser/pdfExtractor": typeof lib_syllabusParser_pdfExtractor;
  "lib/syllabusParser/types": typeof lib_syllabusParser_types;
  "lib/tree": typeof lib_tree;
  "lib/validators": typeof lib_validators;
  library: typeof library;
  materials: typeof materials;
  nodes: typeof nodes;
  notes: typeof notes;
  preferences: typeof preferences;
  profiles: typeof profiles;
  syllabuses: typeof syllabuses;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
