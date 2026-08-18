const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const getValidationErrorMessage = (error) =>
  error.details.map((el) => el.message).join(",");

const isAuthPagePath = (value) =>
  typeof value === "string" && (value.startsWith("/login") || value.startsWith("/signup"));

const getSafeRedirectUrl = (req) => {
  const fallback = "/listings";
  let redirectUrl = fallback;

  if (req.method === "GET") {
    redirectUrl = req.originalUrl;
  } else {
    const listingIdFromParams = req.params?.id;
    if (listingIdFromParams) {
      redirectUrl = `/listings/${listingIdFromParams}`;
    }

    const listingPathMatch = req.originalUrl.match(/^\/listings\/([^/?#]+)/);
    if (listingPathMatch && listingPathMatch[1]) {
      redirectUrl = `/listings/${listingPathMatch[1]}`;
    }

    const referer = req.get("referer");
    if (referer) {
      try {
        const parsed = new URL(referer);
        redirectUrl = `${parsed.pathname}${parsed.search}`;
      } catch {
        if (referer.startsWith("/")) {
          redirectUrl = referer;
        }
      }
    }
  }

  if (!redirectUrl.startsWith("/") || redirectUrl.startsWith("//")) {
    return fallback;
  }

  if (isAuthPagePath(redirectUrl)) {
    return fallback;
  }

  return redirectUrl;
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Save intended URL so user returns here after successful login.
    const redirectUrl = getSafeRedirectUrl(req);
    req.session.redirectUrl = redirectUrl;
    req.flash("error", "You must be logged in first!");
    return res.redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/listings");
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    // Keep Joi validation details readable for the global error handler.
    throw new ExpressError(400, getValidationErrorMessage(error));
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, getValidationErrorMessage(error));
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
