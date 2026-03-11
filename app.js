const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const resultBox = document.getElementById("result");

function normalize(text) {
  return text.toLowerCase().trim();
}

function findBestMatch(catalog, query) {
  const q = normalize(query);

  // 1. exact name match
  let result = catalog.find(item => normalize(item.name) === q);
  if (result) return result;

  // 2. exact alias match
  result = catalog.find(item =>
    (item.aliases || []).some(alias => normalize(alias) === q)
  );
  if (result) return result;

  // 3. partial name match
  result = catalog.find(item => normalize(item.name).includes(q));
  if (result) return result;

  // 4. partial alias match
  result = catalog.find(item =>
    (item.aliases || []).some(alias => normalize(alias).includes(q))
  );
  if (result) return result;

  return null;
}

async function searchMusic() {
  const message = queryInput.value.trim();

  if (!message) {
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = "Please type a song or artist name.";
    return;
  }

  resultBox.classList.remove("hidden");
  resultBox.innerHTML = "Searching...";

  try {
    const response = await fetch("catalog.json");
    const catalog = await response.json();

    const result = findBestMatch(catalog, message);

    if (!result) {
      resultBox.innerHTML = "I couldn’t find that song or artist on this website.";
      return;
    }

    let reply = "";
    let label = "";

    if (result.type === "artist") {
      reply = `I found the artist ${result.name}.`;
      label = result.name;
    } else {
      reply = `I found the song ${result.name} by ${result.artist}.`;
      label = `${result.name} — ${result.artist}`;
    }

    resultBox.innerHTML = `
      <div>${reply}</div>
      <a href="${result.url}" target="_blank" rel="noopener noreferrer">${label}</a>
    `;
  } catch (error) {
    resultBox.innerHTML = "There was a problem loading the music data.";
  }
}

searchBtn.addEventListener("click", searchMusic);

queryInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    searchMusic();
  }
});