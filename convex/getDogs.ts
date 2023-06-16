import { query } from "./_generated/server";

export default query(async ({ db, storage, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to getDogs");
  }

  const user = await db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
  if (!user) {
    throw new Error("Unauthenticated call to getDogs");
  }

  const myDogs = await db
    .query("dogs")
    .withIndex("by_user_id", (q) => q.eq("user_id", user._id.toString()))
    .collect();

  return Promise.all(
    myDogs.map(async (dog) => ({
      ...dog,
      ...(dog.file ? { url: await storage.getUrl(dog.file) } : {}),
    }))
  );
});
