This is an example app using Typeform as a way to get data into a Convex project!

The frontend (in `/app`) is custom to my specific example app, a dog-spotting "social media" app 
using a Typeform to collect the dogs users have seen.

If you want to reuse some pieces of this to add your own Typeform integration, here's what you need:

## Import existing typeform reponses

`node scripts/setupTypeformMappings.js [form_id]`

Edit `typeformData/mappings_[form_id].json` to have the table name and field names you want

`node scripts/importTypeform.js`

Copy and past the `npx convex import` statements to import the responses and necessary metadata

## Set up Typeform->Convex webhook

To save new responses as they come into your typeform using a [webhook](https://www.typeform.com/help/a/webhooks-360029573471/):

Copy `convex/saveTypeformResponse.ts`, `convex/authenticateTypeformWebhook.ts`, and `convex/https.ts` into to your project 

`npx convex dev`

`node scripts/setupWebhook.js --form-id [form_id] --deployment_url [convex_deployment_url]`

(find your prod or dev convex URL in `.env` or `.env.local` respectively)




