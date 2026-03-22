const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const buildSearchQuery = (location, country) =>
  [location, country].filter(Boolean).join(", ");

const createGeocodingClient = (token) => {
  if (!token) {
    throw new Error("MAP_TOKEN missing. Please add it in your .env file.");
  }
  return mbxGeocoding({ accessToken: token });
};

const fetchPointGeometry = async (geocodingClient, location, country) => {
  const query = buildSearchQuery(location, country);
  // Ask Mapbox for the best match and take the first feature.
  const response = await geocodingClient
    .forwardGeocode({
      query,
      limit: 1,
    })
    .send();

  const geometry = response?.body?.features?.[0]?.geometry;
  // Accept only valid Point geometry to keep map rendering predictable.
  if (geometry?.type === "Point" && Array.isArray(geometry.coordinates)) {
    return geometry;
  }

  return null;
};

module.exports = {
  buildSearchQuery,
  createGeocodingClient,
  fetchPointGeometry,
};
