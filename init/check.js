const mongoose = require("mongoose");
const Listing = require("../models/listing");

async function run() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    const count = await Listing.countDocuments();
    console.log("count", count);
    const sample = await Listing.findOne();
    console.log("sample", sample);
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}

run();
