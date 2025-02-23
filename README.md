This is an example app using Typeform as a way to get data into a Convex project!

The frontend (in `/app`) is custom to my specific example app, a dog-spotting "social media" app 
using a Typeform to collect the dogs users have seen. It's here for developing the scripts and 
Convex functions for Typeform integration, but isn't itself reusable since it's tightly coupled to
my specific example Typeform.

Here's how to use the general tools/scripts/functions in this repo to add your own Typeform integration

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
1. Copy `convex/typeform.ts`, `convex/authenticateTypeformWebhook.ts`, and `convex/https.ts` into to your project 
2. Run `npx convex dev`
3. Find your prod or dev convex URL in `.env` or `.env.local` respectively
4. Run `node scripts/setupWebhook.js --form-id [form_id] --deployment-url [convex_deployment_url]`
5. Add the TYPEFORM_SECRET_TOKEN that was printed out as an [environment variable](https://docs.convex.dev/production/environment-variables) in Convex
6. Test your webhook by filling out your form, or by sending a test webhook [(step 6 here)](https://www.typeform.com/help/a/webhooks-360029573471/)

# What is Convex?

[Convex](https://convex.dev) is a hosted backend platform with a
built-in database that lets you write your
[database schema](https://docs.convex.dev/database/schemas) and
[server functions](https://docs.convex.dev/functions) in
[TypeScript](https://docs.convex.dev/typescript). Server-side database
[queries](https://docs.convex.dev/functions/query-functions) automatically
[cache](https://docs.convex.dev/functions/query-functions#caching--reactivity) and
[subscribe](https://docs.convex.dev/client/react#reactivity) to data, powering a
[realtime `useQuery` hook](https://docs.convex.dev/client/react#fetching-data) in our
[React client](https://docs.convex.dev/client/react). There are also
[Python](https://docs.convex.dev/client/python),
[Rust](https://docs.convex.dev/client/rust),
[ReactNative](https://docs.convex.dev/client/react-native), and
[Node](https://docs.convex.dev/client/javascript) clients, as well as a straightforward
[HTTP API](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L40).

The database support
[NoSQL-style documents](https://docs.convex.dev/database/document-storage) with
[relationships](https://docs.convex.dev/database/document-ids) and
[custom indexes](https://docs.convex.dev/database/indexes/)
(including on fields in nested objects).

The
[`query`](https://docs.convex.dev/functions/query-functions) and
[`mutation`](https://docs.convex.dev/functions/mutation-functions) server functions have transactional,
low latency access to the database and leverage our
[`v8` runtime](https://docs.convex.dev/functions/runtimes) with
[determinism guardrails](https://docs.convex.dev/functions/runtimes#using-randomness-and-time-in-queries-and-mutations)
to provide the strongest ACID guarantees on the market:
immediate consistency,
serializable isolation, and
automatic conflict resolution via
[optimistic multi-version concurrency control](https://docs.convex.dev/database/advanced/occ) (OCC / MVCC).

The [`action` server functions](https://docs.convex.dev/functions/actions) have
access to external APIs and enable other side-effects and non-determinism in
either our
[optimized `v8` runtime](https://docs.convex.dev/functions/runtimes) or a more
[flexible `node` runtime](https://docs.convex.dev/functions/runtimes#nodejs-runtime).

Functions can run in the background via
[scheduling](https://docs.convex.dev/scheduling/scheduled-functions) and
[cron jobs](https://docs.convex.dev/scheduling/cron-jobs).

Development is cloud-first, with
[hot reloads for server function](https://docs.convex.dev/cli#run-the-convex-dev-server) editing via the
[CLI](https://docs.convex.dev/cli). There is a
[dashbord UI](https://docs.convex.dev/dashboard) to
[browse and edit data](https://docs.convex.dev/dashboard/deployments/data),
[edit environment variables](https://docs.convex.dev/production/environment-variables),
[view logs](https://docs.convex.dev/dashboard/deployments/logs),
[run server functions](https://docs.convex.dev/dashboard/deployments/functions), and more.

There are built-in features for
[reactive pagination](https://docs.convex.dev/database/pagination),
[file storage](https://docs.convex.dev/file-storage),
[reactive search](https://docs.convex.dev/text-search),
[https endpoints](https://docs.convex.dev/functions/http-actions) (for webhooks),
[streaming import/export](https://docs.convex.dev/database/import-export/), and
[runtime data validation](https://docs.convex.dev/database/schemas#validators) for
[function arguments](https://docs.convex.dev/functions/args-validation) and
[database data](https://docs.convex.dev/database/schemas#schema-validation).

Everything scales automatically, and it’s [free to start](https://www.convex.dev/plans).
