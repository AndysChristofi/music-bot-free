const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const chatMessages = document.getElementById("chatMessages");
const reloadBtn = document.getElementById("reloadChat");

const welcomeMessage =
  "Γειά σου. Είμαι ο DJ Robo, ο μουσικός σου βοηθός. Είμαι εδώ για να σε βοηθήσω να ανακαλύψεις τις καλύτερες μουσικές επιλογές και να ακούσεις τους αγαπημένους σου καλλιτέχνες.";

function normalize(text) {
  return text.toLowerCase().trim();
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createAvatar(hidden = false) {
  const avatar = document.createElement("img");
  avatar.src = "logo.png";
  avatar.alt = "DJ Robo";
  avatar.className = hidden ? "message-avatar hidden" : "message-avatar";
  return avatar;
}

function addMessage(text, sender = "bot", link = null, linkLabel = null) {
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;

  if (sender === "bot") {
    row.appendChild(createAvatar(false));
  }

  const bubbleWrap = document.createElement("div");
  bubbleWrap.className = "message-bubble-wrap";

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

  bubbleWrap.appendChild(bubble);
  row.appendChild(bubbleWrap);

  chatMessages.appendChild(row);
  scrollToBottom();
}

function addTypingIndicator() {
  const row = document.createElement("div");
  row.className = "message-row bot";
  row.id = "typingRow";

  row.appendChild(createAvatar(false));

  const bubbleWrap = document.createElement("div");
  bubbleWrap.className = "message-bubble-wrap";

  const bubble = document.createElement("div");
  bubble.className = "message bot";

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";

  bubble.appendChild(typing);
  bubbleWrap.appendChild(bubble);
  row.appendChild(bubbleWrap);

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

  result = catalog.find(item => normalize(item.name).includes(q));
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
      text: `Εδώ είναι η σελίδα του ${result.name}:`,
      label: result.name
    };
  }

  return {
    text: `Εδώ είναι το τραγούδι ${result.name}${result.artist ? ` από ${result.artist}` : ""}:`,
    label: result.artist ? `${result.name} — ${result.artist}` : result.name
  };
}

function resetChat() {
  chatMessages.innerHTML = "";
  addMessage(welcomeMessage, "bot");
}

async function handleSearch(customMessage = null) {
  const message = customMessage || queryInput.value.trim();

  if (!message) {
    addMessage("Γράψε πρώτα όνομα τραγουδιού ή καλλιτέχνη.", "bot");
    return;
  }

  addMessage(message, "user");
  queryInput.value = "";
  addTypingIndicator();

  try {
    const response = await fetch("catalog.json");
    const catalog = await response.json();

    await new Promise(resolve => setTimeout(resolve, 450));

    removeTypingIndicator();

    const result = findBestMatch(catalog, message);

    if (!result) {
      addMessage("Δεν βρήκα αυτό το τραγούδι ή τον καλλιτέχνη. Δοκίμασε άλλο όνομα.", "bot");
      return;
    }

    const reply = buildReply(result);
    addMessage(reply.text, "bot", result.url, reply.label);
  } catch (error) {
    removeTypingIndicator();
    addMessage("Υπήρξε πρόβλημα στη φόρτωση των δεδομένων. Δοκίμασε ξανά.", "bot");
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

  reloadBtn.addEventListener("click", function () {
    queryInput.value = "";
    resetChat();
  });
});
