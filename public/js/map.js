const mapDataElement = document.getElementById("map-data");

if (!mapDataElement) {
  throw new Error("Map data is missing from the page.");
}

const { mapToken, listing } = JSON.parse(mapDataElement.textContent);

mapboxgl.accessToken = mapToken;

const coordinates = listing?.geometry?.coordinates;

if (!Array.isArray(coordinates) || coordinates.length !== 2) {
  throw new Error("Listing coordinates are missing or invalid.");
}

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: coordinates,
  zoom: 9,
});

const markerElement = document.createElement("div");
markerElement.innerHTML = '<i class="fa-regular fa-compass"></i>';
markerElement.style.fontSize = "1.8rem";
markerElement.style.color = "#fe424d";

const marker = new mapboxgl.Marker({ element: markerElement })
  .setLngLat(coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h5>${listing.location}</h5><p>Exact location provided after booking</p>`,
    ),
  )
  .addTo(map);
