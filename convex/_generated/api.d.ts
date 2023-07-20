/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@0.19.0.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as app from "../app";
import type * as authenticateTypeformWebhook from "../authenticateTypeformWebhook";
import type * as http from "../http";
import type * as storeUser from "../storeUser";
import type * as typeform from "../typeform";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  app: typeof app;
  authenticateTypeformWebhook: typeof authenticateTypeformWebhook;
  http: typeof http;
  storeUser: typeof storeUser;
  typeform: typeof typeform;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
