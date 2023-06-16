const commander = require("commander");
const crypto = require("crypto");

function stripDeploymentUrl(url) {
  let slug = url;
  slug = slug.trim();
  if (slug.slice(0, 8) === "https://") {
    slug = slug.slice(8);
  }
  for (const endString of [".site", ".cloud", ".convex"]) {
    const idx = -1 * endString.length;
    if (slug.slice(idx) === endString) {
      slug = slug.slice(0, idx);
    }
  }
  return slug;
}

function generateTypeformWebhookToken() {
  return `TF${crypto.randomBytes(20).toString("hex")}`;
}

async function setupTypeformWebhook() {
  commander
    .usage("[OPTIONS]...")
    .option(
      "--form-id <value>",
      "Typeform Form ID (find in the url of your typeform)"
    )
    .option(
      "--deployment-url <value>",
      "Convex deployment URL ((find it in .env for prod or .env.local for dev)"
    )
    .parse(process.argv);

  const options = commander.opts();
  const { formId, deploymentUrl } = options;
  if (!formId) {
    console.log(
      "Provide your form ID (an 8 character string found in your form url) as an argument"
    );
    return;
  }
  if (!deploymentUrl) {
    console.log(
      "Provide your Convex deployment URL (find it in .env for prod or .env.local for dev)"
    );
    return;
  }

  const deploymentSlug = stripDeploymentUrl(deploymentUrl);
  const secret = generateTypeformWebhookToken();
  const webhookData = {
    enabled: true,
    secret,
    url: `https://${deploymentSlug}.convex.site/typeformWebhook`,
    verify_ssl: true,
  };
  const tag = `convex-${deploymentSlug}`;

  const webhookResponse = await fetch(
    `https://api.typeform.com/forms/${formId}/webhooks/${tag}`,
    {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env["TYPEFORM_API_KEY"]}`,
      }),
      body: JSON.stringify(webhookData),
    }
  );
  if (!webhookResponse.ok) {
    return `Webhook setup failure: ${webhookResponse.statusText}`;
  } else {
    console.log(
      "Go to your convex dashboard and add the following as Environment Variable:"
    );
    console.log("KEY: TYPEFORM_SECRET_TOKEN");
    console.log(`VALUE: ${secret}`);
    return "Successfully set up your webhook!";
  }
}

setupTypeformWebhook().then(console.log);
