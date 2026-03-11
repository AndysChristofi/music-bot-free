const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const chatMessages = document.getElementById("chatMessages");
const suggestionButtons = document.querySelectorAll(".suggestion-btn");
const reloadBtn = document.getElementById("reloadChat");

const welcomeMessage =
  "Γειά σου. Είμαι ο DJ Robo, ο μουσικός σου βοηθός. Είμαι εδώ για να σε βοηθήσω να ανακαλύψεις τις καλύτερες μουσικές επιλογές και να ακούσεις τους αγαπημένους σου καλλιτέχνες.";

function normalize(text) {
  return text.toLowerCase().trim();
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
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
    const linkNode = document.createElement("a");
    linkNode.href = link;
    linkNode.target = "_blank";
    linkNode.rel = "noopener noreferrer";
    linkNode.textContent = linkLabel;
    bubble.appendChild(linkNode);
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
  if (typingRow) {
    typingRow.remove();
  }
}

function findBestMatch(catalog, query) {
  const q = normalize(query);

  let result = catalog.find(item => normalize(item.name) === q);
  if (result) return result;

  result = catalog.find(item =>
    (item.aliases || []).some(alias => normalize(alias) === q)
  );
  if (result) return result;

  result = catalog.find(item =>
    normalize(item.name).includes(q)
  );
  if (result) return result;

  result = catalog.find(item =>
    (item.aliases || []).some(alias => normalize(alias).includes(q))
  );
  if (result) return result;

  result = catalog.find(item => {
    const combined = `${item.name} ${item.artist || ""}`;
    return normalize(combined).includes(q);
  });
  if (result) return result;

  return null;
}

function buildReply(result) {
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

function resetChat() {
  chatMessages.innerHTML = "";
  addMessage(welcomeMessage, "bot");
}

async function handleSearch(customMessage = null) {
  const message = customMessage || queryInput.value.trim();

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

    const reply = buildReply(result);
    addMessage(reply.text, "bot", result.url, reply.label);
  } catch (error) {
    removeTypingIndicator();
    addMessage("Υπήρξε πρόβλημα στη φόρτωση των δεδομένων. Δοκίμασε ξανά.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  resetChat();

  searchBtn.addEventListener("click", function () {
    handleSearch();
  });

  queryInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

  suggestionButtons.forEach(button => {
    button.addEventListener("click", function () {
      handleSearch(button.textContent);
    });
  });

  reloadBtn.addEventListener("click", function () {
    queryInput.value = "";
    resetChat();
  });
});
