const { Musician, Band } = require("./models/index");
const { db } = require("./db/connection");
const { seedMusician, seedBand } = require("./seedData");

// In seed.js
const syncSeed = async () => {
  await db.sync({ force: true });
  await Promise.all(seedMusician.map((musician) => Musician.create(musician)));
  await Promise.all(seedBand.map((band) => Band.create(band)));
};

syncSeed();
