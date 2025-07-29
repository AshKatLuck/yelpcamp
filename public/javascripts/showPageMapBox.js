mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/satellite-streets-v12",
  center: campground.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 4, // starting zoom
});

const marker = new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${campground.title}</h3><p>${campground.location}</p>`
    )
  )
  .addTo(map);
