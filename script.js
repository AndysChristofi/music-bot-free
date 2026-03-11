const params = new URLSearchParams(window.location.search);
const client = params.get("client") || "SkyRadioMcMedia"; // default client

fetch(`catalogs/${client}.json`)
  .then(res => res.json())
  .then(data => {
    catalog = data;  // your bot uses this
  })
  .catch(err => {
    console.error("Failed to load catalog:", err);
  });

