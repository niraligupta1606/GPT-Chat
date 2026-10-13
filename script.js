const chat = document.getElementById("chat");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const input = document.getElementById("userInput");
const form = document.getElementById("chatForm");
const historyBox = document.getElementById("history");
const sidebar = document.getElementById("sidebar");

let chats = [];
let currentChatId = null;
let replyTimer = null;

function makeChat() {
    const item = {
        id: Date.now() + Math.random(),
        title: "New Chat",
        messages: []
    };

    chats.unshift(item);
    currentChatId = item.id;
    renderHistory();
    renderMessages();
    input.focus();
    sidebar.classList.remove("open");
}

function currentChat() {
    return chats.find(item => item.id === currentChatId);
}

function renderHistory() {
    historyBox.replaceChildren();

    chats.forEach(item => {
        const row = document.createElement("div");
        row.className = "history-item" +
            (item.id === currentChatId ? " active" : "");

        const title = document.createElement("button");
        title.className = "history-title";
        title.textContent = "▤ " + item.title;
        title.onclick = () => {
            currentChatId = item.id;
            renderHistory();
            renderMessages();
            sidebar.classList.remove("open");
        };

        const remove = document.createElement("button");
        remove.className = "delete-chat icon-btn";
        remove.textContent = "×";
        remove.title = "Delete chat";
        remove.setAttribute("aria-label", "Delete chat");
        remove.onclick = event => {
            event.stopPropagation();

            if (replyTimer) {
                clearTimeout(replyTimer);
                replyTimer = null;
            }

            chats = chats.filter(chat => chat.id !== item.id);

            if (currentChatId === item.id) {
                currentChatId = chats.length ? chats[0].id : null;
            }

            if (!currentChatId) {
                makeChat();
            } else {
                renderHistory();
                renderMessages();
            }
        };

        row.append(title, remove);
        historyBox.appendChild(row);
    });
}

function renderMessages() {
    messages.replaceChildren();

    const item = currentChat();
    const hasMessages = item && item.messages.length > 0;

    welcome.style.display = hasMessages ? "none" : "block";

    if (!item) return;

    item.messages.forEach(message => {
        addMessageElement(message.role, message.text);
    });

    chat.scrollTop = chat.scrollHeight;
}

function addMessageElement(role, text) {
    const row = document.createElement("div");
    row.className = "message";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "Y" : "✦";

    const content = document.createElement("div");
    content.className = "message-content";

    const paragraph = document.createElement("p");
    // textContent prevents user input from being treated as HTML.
    paragraph.textContent = text;
    content.appendChild(paragraph);

    if (role === "assistant") {
        const actions = document.createElement("div");
        actions.className = "message-actions";

        const copy = document.createElement("button");
        copy.className = "copy-btn";
        copy.textContent = "Copy";
        copy.onclick = async () => {
            try {
                await navigator.clipboard.writeText(text);
                copy.textContent = "Copied!";
            } catch {
                copy.textContent = "Copy unavailable";
            }

            setTimeout(() => {
                copy.textContent = "Copy";
            }, 1500);
        };

        actions.appendChild(copy);
        content.appendChild(actions);
    }

    row.append(avatar, content);
    messages.appendChild(row);
}

function makeReply(text) {
    const question = text.toLowerCase();

    if (question.includes("hello") ||
        question.includes("hi")) {
        return "Hello! 👋 Welcome to GPT Chat. What would you like to learn today?";
    }

    if (question.includes("html")) {
        return "HTML stands for HyperText Markup Language. It creates the structure of a webpage using tags such as <h1>, <p>, <img> and <a>.\n\nExample:\n<h1>Hello World</h1>\n<p>My first webpage</p>";
    }

    if (question.includes("css")) {
        return "CSS stands for Cascading Style Sheets. It controls the appearance of a webpage.\n\nExample:\nbody {\n  background-color: lightblue;\n  font-family: Arial;\n}\n\nCSS can change colors, spacing, fonts and layouts.";
    }

    if (question.includes("javascript") ||
        question.includes(" js ")) {
        return "JavaScript makes webpages interactive. For example, it can react to button clicks and change HTML content.\n\nExample:\ndocument.getElementById('demo').textContent = 'Hello!';";
    }

    if (question.includes("dom")) {
        return "DOM means Document Object Model. It lets JavaScript find and modify webpage elements.\n\nUseful methods:\n• getElementById()\n• querySelector()\n• addEventListener()\n• textContent";
    }

    if (question.includes("git") ||
        question.includes("github")) {
        return "Git tracks changes to your code. GitHub hosts repositories online.\n\nUseful commands:\n• git init — initialize a repository\n• git add . — stage changes\n• git commit -m \"message\" — record changes\n• git push — upload commits\n• git pull — fetch and integrate changes";
    }

    if (question.includes("study") ||
        question.includes("plan")) {
        return "Here is a simple study plan:\n\n1. Study one topic for 25 minutes.\n2. Practise examples for 20 minutes.\n3. Test yourself for 10 minutes.\n4. Take a short break.\n5. Revise difficult concepts.";
    }

    if (question.includes("who are you") ||
        question.includes("your name")) {
        return "I'm GPT Chat, a demo chatbot interface built using HTML, CSS and JavaScript. I use predefined replies, so I am not connected to a real AI model.";
    }

    if (question.includes("thank")) {
        return "You're welcome! 😊 Feel free to ask me about HTML, CSS, JavaScript or other topics covered by this demo.";
    }

    return "That's an interesting question! 😊\n\nI'm currently running in demo mode, so I can respond to a few predefined topics. To answer arbitrary questions like a real AI assistant, this frontend needs to be connected to an AI model through a secure backend.";
}

function sendMessage(text) {
    text = text.trim();
    if (!text) return;

    if (replyTimer) {
        clearTimeout(replyTimer);
        replyTimer = null;
    }

    if (!currentChat()) {
        makeChat();
    }

    const item = currentChat();

    item.messages.push({
        role: "user",
        text: text
    });

    if (item.title === "New Chat") {
        item.title = text.length > 25
            ? text.slice(0, 25) + "..."
            : text;
    }

    welcome.style.display = "none";
    renderHistory();
    renderMessages();

    input.value = "";
    input.style.height = "auto";

    const typing = document.createElement("div");
    typing.className = "message typing";
    typing.textContent = "✦ GPT is thinking...";
    messages.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    replyTimer = setTimeout(() => {
        replyTimer = null;

        // The selected chat may have changed while waiting.
        if (currentChatId !== item.id) return;

        const reply = makeReply(text);

        item.messages.push({
            role: "assistant",
            text: reply
        });

        renderMessages();
        renderHistory();
    }, 600);
}

form.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage(input.value);
});

input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
    }
});

input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height =
        Math.min(input.scrollHeight, 160) + "px";
});

document.getElementById("newChat").onclick = makeChat;

document.getElementById("clearBtn").onclick = () => {
    if (!currentChat()) return;

    if (replyTimer) {
        clearTimeout(replyTimer);
        replyTimer = null;
    }

    currentChat().messages = [];
    currentChat().title = "New Chat";

    renderHistory();
    renderMessages();
};

document.getElementById("themeBtn").onclick = () => {
    document.body.classList.toggle("dark");

    document.getElementById("themeBtn").textContent =
        document.body.classList.contains("dark")
            ? "☀ Light Mode"
            : "☾ Toggle Theme";
};

document.getElementById("menuBtn").onclick = () => {
    sidebar.classList.add("open");
};

document.getElementById("closeSidebar").onclick = () => {
    sidebar.classList.remove("open");
};

document.querySelectorAll(".suggestion").forEach(button => {
    button.addEventListener("click", () => {
        sendMessage(button.dataset.prompt);
    });
});

// Start with a fresh conversation.
makeChat();