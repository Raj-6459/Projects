const User = require("../models/user");

const isSafeRedirectPath = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

const isAuthPagePath = (value) =>
  typeof value === "string" && (value.startsWith("/login") || value.startsWith("/signup"));

const getRedirectFromReferer = (referer) => {
  if (!referer || typeof referer !== "string") {
    return "";
  }

  try {
    const parsed = new URL(referer);
    const path = `${parsed.pathname}${parsed.search}`;
    if (!isSafeRedirectPath(path) || isAuthPagePath(path)) {
      return "";
    }
    return path;
  } catch {
    if (!isSafeRedirectPath(referer) || isAuthPagePath(referer)) {
      return "";
    }
    return referer;
  }
};

module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  const redirectFromQuery = isSafeRedirectPath(req.query.redirect)
    ? req.query.redirect
    : "";
  const redirectFromReferer = getRedirectFromReferer(req.get("referer"));
  const redirectUrl = redirectFromQuery || redirectFromReferer;

  if (redirectUrl) {
    req.session.redirectUrl = redirectUrl;
  }

  res.render("users/login.ejs", { redirectUrl });
};

module.exports.login = async (req, res) => {
 
  const redirectFromBody = isSafeRedirectPath(req.body.redirectUrl)
    && !isAuthPagePath(req.body.redirectUrl)
    ? req.body.redirectUrl
    : null;

  const redirectFromSession = isSafeRedirectPath(req.session.redirectUrl)
    && !isAuthPagePath(req.session.redirectUrl)
    ? req.session.redirectUrl
    : null;

  const redirectUrl = redirectFromBody || redirectFromSession || "/listings";
  delete req.session.redirectUrl;

  req.flash("success", "Welcome back to Wanderlust!");
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};
