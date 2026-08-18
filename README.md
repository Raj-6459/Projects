# Wanderlust - Full Stack Listing App

Wanderlust is a full stack web app where users can:

- create travel stay listings,
- upload listing images,
- add and delete reviews,
- sign up, log in, and log out,
- and view listing locations on an interactive map.

This project uses Node.js, Express, MongoDB, EJS, Passport, Cloudinary, and Mapbox.

## Features

- User authentication (signup, login, logout)
- Session-based auth with MongoDB session store
- Create, read, update, delete (CRUD) listings
- Image upload with Multer + Cloudinary
- Listing ownership checks (only owner can edit/delete listing)
- Review create/delete with author checks
- Server-side validation using Joi
- Flash messages for success/error feedback
- Mapbox map on listing detail page

## Tech Stack

- Backend: Node.js, Express
- Database: MongoDB + Mongoose
- Templating: EJS + ejs-mate
- Auth: Passport, passport-local, passport-local-mongoose
- Validation: Joi
- File Upload: Multer
- Image Hosting: Cloudinary
- Maps/Geocoding: Mapbox SDK + mapbox-gl-js
- Sessions: express-session + connect-mongo

## Project Structure

```
MAJOR_PROJECT/
|- app.js                # Express app entry point
|- cloudConfig.js        # Cloudinary + Multer config
|- middleware.js         # Auth, ownership, validation middleware
|- schema.js             # Joi schemas
|- controllers/          # Request handling logic
|- Routes/               # Route definitions
|- models/               # Mongoose models
|- views/                # EJS templates
|- public/               # CSS and client-side JS
|- utils/                # Shared utilities
|- init/                 # Seed/init scripts
|- package.json
```

## Prerequisites

- Node.js (project currently declares engine: 24.13.0)
- npm
- MongoDB connection string
- Cloudinary account
- Mapbox account/token

## Architecture:
MVC (Model-View-Controller) pattern for clean separation of concerns and modular code maintainability.