"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import crypto from "crypto";

export const authenticate = internalAction({
  args: {
    requestBodyString: v.optional(v.string()),
    signature: v.union(v.string(), v.null()),
  },
  handler: (_, { requestBodyString, signature }) => {
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
  },
});
