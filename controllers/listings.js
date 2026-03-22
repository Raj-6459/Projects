const Listing = require("../models/listing");
const { uploadToCloudinary, deleteFromCloudinary } = require("../cloudConfig.js");
const {
  createGeocodingClient,
  fetchPointGeometry,
} = require("../utils/geocoding.js");
const { FALLBACK_GEOMETRY } = require("../utils/listingDefaults.js");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mapToken ? createGeocodingClient(mapToken) : null;

// Shared helper used by create and update to keep media + geometry logic in one place.
const applyListingMediaAndGeometry = async (
  listing,
  file,
  options = { forceGeometryRefresh: false },
) => {
  const { forceGeometryRefresh } = options;

  if (file) {
    const uploadedImage = await uploadToCloudinary(file.buffer);
    listing.image = {
      url: uploadedImage.secure_url,
      filename: uploadedImage.public_id,
    };
  }

  if (geocodingClient) {
    const geometry = await fetchPointGeometry(
      geocodingClient,
      listing.location,
      listing.country,
    );
    listing.geometry = geometry || FALLBACK_GEOMETRY;
    return;
  }

  if (forceGeometryRefresh || !listing.geometry) {
    listing.geometry = FALLBACK_GEOMETRY;
  }
};

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  // Load author details for both listing owner and each review author.
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing, mapToken });
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  await applyListingMediaAndGeometry(newListing, req.file);

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image?.url || "";
  // Render a lightweight preview image in edit view.
  if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");
  }
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  const previousLocation = listing.location;
  const previousCountry = listing.country;

  Object.assign(listing, req.body.listing);

  const locationChanged =
    previousLocation !== listing.location || previousCountry !== listing.country;

  await applyListingMediaAndGeometry(listing, req.file, {
    forceGeometryRefresh: locationChanged,
  });

  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (listing && listing.image && listing.image.filename) {
    await deleteFromCloudinary(listing.image.filename);
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
