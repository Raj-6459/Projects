if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/review.js");
const MONGO_URL = process.env.MONGO_URL;
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userRouter = require("./Routes/user.js");
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!MONGO_URL) {
  throw new Error("MONGO_URL is required in environment variables.");
}

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in environment variables.");
}

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

//  DB connection
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => {
    console.log("Connected to Mongodb successfully");
  })
  .catch((err) => {
    console.log(err);
  });

//  Session store setup
// Persist sessions in MongoDB for every environment to keep auth state centralized.
let store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

// Session cookie config
const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

sessionOptions.store = store;

// Express middleware pipeline
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//  Authentication wiring (Passport)
// Plug passport-local-mongoose helpers into Passport strategy + session lifecycle.
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global template variables
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
});

// Route mounting
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//  Error system
// Catch all unmatched routes and forward to the shared error handler.
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

// Server startup + port conflict handling
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`server is listening to port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other process or use a different PORT.`,
    );
    return;
  }
  console.error(err);
});
