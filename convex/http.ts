import {httpRouter} from "convex/server";
import {httpAction} from "./_generated/server";

const http = httpRouter();




const typeformWebhook = httpAction(async ({ runMutation }, request) => {
  const typeformResponse = await request.json();
  const {form_id: formId, answers} = typeformResponse.form_response;

  await runMutation('saveTypeformResponse', {formId, answers})


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