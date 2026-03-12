const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const chatMessages = document.getElementById("chatMessages");
const reloadBtn = document.getElementById("reloadChat");

const welcomeMessage =
  "Γειά σου. Είμαι ο DJ Robo, ο μουσικός σου βοηθός. Είμαι εδώ για να σε βοηθήσω να ανακαλύψεις τις καλύτερες μουσικές επιλογές και να ακούσεις τους αγαπημένους σου καλλιτέχνες.";

const API_BASE = "https://dj-robo-api.christofi280.workers.dev";

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createAvatar() {
  const avatar = document.createElement("img");
  avatar.src = "logo.png";
  avatar.alt = "DJ Robo";
  avatar.className = "message-avatar";
  return avatar;
}

function addMessage(text, sender = "bot", link = null, linkLabel = null) {
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;

  if (sender === "bot") {
    row.appendChild(createAvatar());
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

  row.appendChild(createAvatar());

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

function resetChat() {
  chatMessages.innerHTML = "";
  addMessage(welcomeMessage, "bot");
}

function buildBotReply(item) {
  if (!item) {
    return {
      text: "Δεν βρήκα αυτό το τραγούδι ή τον καλλιτέχνη. Δοκίμασε άλλο όνομα.",
      link: null,
      label: null
    };
  }

  if (item.song && item.artist) {
    return {
      text: `Εδώ είναι το τραγούδι ${item.song} από ${item.artist}:`,
      link: item.url,
      label: `${item.song} — ${item.artist}`
    };
  }

  return {
    text: "Βρήκα αποτέλεσμα για την αναζήτησή σου:",
    link: item.url || null,
    label: item.song || item.artist || "Άνοιγμα"
  };
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
    const response = await fetch(
      `${API_BASE}/api/search?q=${encodeURIComponent(message)}`
    );

    const data = await response.json();

    removeTypingIndicator();

    if (!data.results || data.results.length === 0) {
      addMessage(
        "Δεν βρήκα αυτό το τραγούδι ή τον καλλιτέχνη. Δοκίμασε άλλο όνομα.",
        "bot"
      );
      return;
    }

    const firstResult = data.results[0];
    const reply = buildBotReply(firstResult);

    addMessage(reply.text, "bot", reply.link, reply.label);
  } catch (error) {
    removeTypingIndicator();
    addMessage(
      "Υπήρξε πρόβλημα στην αναζήτηση. Δοκίμασε ξανά σε λίγο.",
      "bot"
    );
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

  if (reloadBtn) {
    reloadBtn.addEventListener("click", function () {
      queryInput.value = "";
      resetChat();
    });
  }
});
