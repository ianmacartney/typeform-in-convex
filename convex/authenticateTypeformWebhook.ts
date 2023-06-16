"use node";
import { internalAction } from "./_generated/server";
import crypto from "crypto";

type ValidationArgs = { requestBodyString?: string; signature?: string | null };
export const authenticate = internalAction(
  ({}, { requestBodyString, signature }: ValidationArgs) => {
    const typeformSecretToken = process.env.TYPEFORM_SECRET_TOKEN;
    if (!typeformSecretToken) {
      console.error(
        `Must configure TYPEFORM_SECRET_TOKEN as a Convex environment variable`
      );
      return false;
    }
    if (!requestBodyString || !signature) {
      return false;
    }
    const hash = crypto
      .createHmac("sha256", typeformSecretToken)
      .update(requestBodyString.toString())
      .digest("base64");
    return signature === `sha256=${hash}`;
  }
);
