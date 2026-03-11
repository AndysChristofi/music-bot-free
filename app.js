const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const chatMessages = document.getElementById("chatMessages");

const welcomeMessage =
  "Γειά σου. Είμαι ο DJ Robo, ο μουσικός σου βοηθός. Είμαι εδώ για να σε βοηθήσω να ανακαλύψεις τις καλύτερες μουσικές επιλογές και να ακούσεις τους αγαπημένους σου καλλιτέχνες.";

function normalize(text) {
  return text.toLowerCase().trim();
}

function addMessage(text, sender = "bot", link = null, linkLabel = null) {
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = `message ${sender}`;

  const textNode = document.createElement("div");
  textNode.textContent = text;
  bubble.appendChild(textNode);

  if (link && linkLabel) {
    const a = document.createElement("a");
    a.href = link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = linkLabel;
    bubble.appendChild(a);
  }

  row.appendChild(bubble);
  chatMessages.appendChild(row);
  scrollToBottom();
}

function addTypingIndicator() {
  const row = document.createElement("div");
  row.className = "message-row bot";
  row.id = "typingRow";

  const bubble = document.createElement("div");
  bubble.className = "message bot";

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";

  bubble.appendChild(typing);
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  scrollToBottom();
}

function removeTypingIndicator() {
  const typingRow = document.getElementById("typingRow");
  if (typingRow) typingRow.remove();
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function findBestMatch(catalog, query) {
  const q = normalize(query);

  let result = catalog.find(item => normalize(item.name) === q);
  if (result) return result;

  result = catalog.find(item =>
    (item.aliases || []).some(alias => normalize(alias) === q)
  );
  if (result) return result;

  result = catalog.find(item => normalize(item.name).includes(q));
  if (result) return result;

  result = catalog.find(item =>
    (item.aliases || []).some(alias => normalize(alias).includes(q))
  );
  if (result) return result;

  result = catalog.find(item => {
    const songText = `${item.name} ${item.artist || ""}`.toLowerCase();
    return songText.includes(q);
  });
  if (result) return result;

  return null;
}

function buildBotReply(result) {
  if (result.type === "artist") {
    return {
      text: `Βρήκα τον καλλιτέχνη ${result.name}. Πάτησε πιο κάτω για να ανοίξεις τη σελίδα του.`,
      label: result.name
    };
  }

  return {
    text: `Βρήκα το τραγούδι ${result.name} από ${result.artist}. Πάτησε πιο κάτω για να το ανοίξεις.`,
    label: `${result.name} — ${result.artist}`
  };
}

async function searchMusic() {
  const message = queryInput.value.trim();

  if (!message) {
    addMessage("Γράψε πρώτα όνομα τραγουδιού ή καλλιτέχνη.");
    return;
  }

  addMessage(message, "user");
  queryInput.value = "";
  addTypingIndicator();

  try {
    const response = await fetch("catalog.json");
    const catalog = await response.json();

    await new Promise(resolve => setTimeout(resolve, 500));

    removeTypingIndicator();

    const result = findBestMatch(catalog, message);

    if (!result) {
      addMessage("Δεν βρήκα αυτό το τραγούδι ή τον καλλιτέχνη. Δοκίμασε άλλο όνομα.");
      return;
    }

    const botReply = buildBotReply(result);
    addMessage(botReply.text, "bot", result.url, botReply.label);
  } catch (error) {
    removeTypingIndicator();
    addMessage("Υπήρξε πρόβλημα στη φόρτωση των δεδομένων. Δοκίμασε ξανά.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  addMessage(welcomeMessage, "bot");

  searchBtn.addEventListener("click", searchMusic);

  queryInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      searchMusic();
    }
  });
});
