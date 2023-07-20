import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
const http = httpRouter();

const typeformWebhook = httpAction(async (ctx, request) => {
  const requestBodyString = await request.text();
  const isValidSignature = await ctx.runAction(
    internal.authenticateTypeformWebhook.authenticate,
    {
      requestBodyString,
      signature: request.headers.get("typeform-signature"),
    }
  );
  if (!isValidSignature) {
    return new Response(null, { status: 401 });
  }
  const typeformResponse = JSON.parse(requestBodyString);
  const { form_id: formId, answers, hidden } = typeformResponse.form_response;

  await ctx.runMutation(api.typeform.saveResponse, { formId, answers, hidden });
  return new Response(null, {
    status: 200,
  });
});

http.route({
  path: "/typeformWebhook",
  method: "POST",
  handler: typeformWebhook,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
