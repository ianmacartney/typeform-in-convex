This is an example app using Typeform as a way to get data into a Convex project!

The frontend (in `/app`) is custom to my specific example app, a dog-spotting "social media" app 
using a Typeform to collect the dogs users have seen.

If you want to reuse some pieces of this to add your own Typeform integration, here's what you need:

## Import existing typeform responses

1. Get a Typeform [API key](https://www.typeform.com/developers/get-started/personal-access-token/)
2. Run `export TYPEFORM_API_KEY=[your_api_key]`
3. Get your Typeform form_id from the url, eg for https://mysite.typeform.com/to/u6nXL7 the form_id is `u6nXL7`
4. Run `node scripts/setupTypeformMappings.js [form_id]`
5. Edit `typeformData/mappings_[form_id].json` to have the table name and field names you want
6. Run `node scripts/importTypeform.js [form_id]`
7. Copy and past the `npx convex import` statements to import the responses and necessary metadata

## Set up Typeform -> Convex webhook

To save new responses as they come into your typeform using a [webhook](https://www.typeform.com/help/a/webhooks-360029573471/):
0. Run steps 1-7 above to import necessary metadata
1. Copy `convex/saveTypeformResponse.ts`, `convex/authenticateTypeformWebhook.ts`, and `convex/https.ts` into to your project 
2. Run `npx convex dev`
3. Find your prod or dev convex URL in `.env` or `.env.local` respectively
4. Run `node scripts/setupWebhook.js --form-id [form_id] --deployment-url [convex_deployment_url]`
5. Add the TYPEFORM_SECRET_TOKEN that was printed out as an [environment variable](https://docs.convex.dev/production/environment-variables) in Convex
6. Test your webhook by filling out your form, or by sending a test webhook [(step 6 here)](https://www.typeform.com/help/a/webhooks-360029573471/)






