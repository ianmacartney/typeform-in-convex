
import { query } from "./_generated/server";

export default query(async ({ db , auth}) => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to getDogs");
  }

  const user = await db
    .query("users")
    .withIndex("by_token", q =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
  if (!user) {
    throw new Error("Unauthenticated call to getDogs");
  }

  return await db.query("dogs")
    .withIndex("by_user_id", q =>
      q.eq("user_id", user._id.toString()))
    .collect();

});