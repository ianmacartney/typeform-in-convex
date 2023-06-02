import { query } from "./_generated/server";

export default query(async ({db}) => {
  const allDogs = await db.query("dogs").collect();
  const countByLocation: {[k in string]: number} = {}
  for (const dog of allDogs) {
    const loc = dog.location;
    if (!countByLocation[loc]) {
      countByLocation[loc] = 1;
    } else {
      countByLocation[loc] += 1;
    }
  }

  const byLocation = []
  for (const location of Object.keys(countByLocation)) {
    byLocation.push({location, count: countByLocation[location]})
  }
  return {
    count: allDogs.length,
    byLocation,
  }
})