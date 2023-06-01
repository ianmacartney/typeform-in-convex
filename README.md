This is an example app using Typeform as a way to get data into a Convex project!

The frontend (in `/app`) is custom to my specific example app, a dog-spotting "social media" app 
using a Typeform to collect the dogs users have seen.

On the other hand, there are several reusable/general pieces that you could use for your own 
Typeform integration:

Define how you want to map Typeform questions to Convex fields using 

`node scripts/setupTypeformMappings.js`

Save your mappings in Convex and migrate all responses that have already been submitted to your Typeform with

`node scripts/importTypeform.js`

To save new responses as they come into your typeform:

- Copy `convex/saveTypeformResponse.ts` and `convex/https.ts` into to your project 

Set up a [webhook](https://www.typeform.com/help/a/webhooks-360029573471/) in Typeform 
(via the UI or their [API](https://www.typeform.com/developers/webhooks/reference/create-or-update-webhook/))
The endpoint URL will be `https://<your_convex_url>/typeformWebhook`
(find your prod or dev convex URL in `.env` or `.env.local` respectively)


In the future I plan to support:

- All the different typeform question types

