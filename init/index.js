const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const {
  buildSearchQuery,
  createGeocodingClient,
  fetchPointGeometry,
} = require("../utils/geocoding.js");
const { FALLBACK_GEOMETRY } = require("../utils/listingDefaults.js");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = createGeocodingClient(mapToken);

async function getGeometryForListing(obj) {
  const query = buildSearchQuery(obj.location, obj.country);

  try {
    const geometry = await fetchPointGeometry(
      geocodingClient,
      obj.location,
      obj.country,
    );
    if (geometry) {
      return geometry;
    }

    // Seed should not fail for one bad location; use deterministic fallback.
    console.warn(`Geocoding empty for: ${query}. Using fallback coordinates.`);
    return FALLBACK_GEOMETRY;
  } catch (err) {
    console.warn(`Geocoding failed for: ${query}. Using fallback coordinates.`);
    return FALLBACK_GEOMETRY;
  }
}

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const preparedData = [];
  for (const obj of initData.data) {
    const geometry = await getGeometryForListing(obj);
    preparedData.push({
      ...obj,
      owner: "69ab70970a33503177a946da",
      geometry,
    });
  }

  await Listing.insertMany(preparedData);
  console.log("data was initialized");
};

main()
  .then(() => {
    console.log("Connected to Mongodb successfully");
    return initDB();
  })
  .then(async () => {
    await mongoose.connection.close();
    console.log("Database connection closed");
  })
  .catch(async (err) => {
    console.log(err);
    await mongoose.connection.close();
  });
