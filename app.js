const OPENAI_API_KEY = "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";

const form = document.querySelector("#userForm");
const input = document.querySelector("#userMessage");
const chat = document.querySelector("#chat");

const USER_ICON = "";
const ASSIST_ICON = "";

document.addEventListener("DOMContentLoaded", (event) => {
  const form = document.getElementById("userForm");
  const userMessage = document.getElementById("userMessage");
  const chatUserMessage = document.querySelector(".chat-message-user p");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = userMessage.value;
    if (text) {
      chatUserMessage.textContent = text;
      userMessage.value = "";
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value;
  if (!text) return;

  input.value = "";
  appendMessage("user", text);
  aiResponse(text);
});

function appendMessage(from, text) {
  const styleClass =
    from == "user"
      ? "chat-message-user"
      : from == "user"
      ? "chat-message-ai"
      : "";

  const HTML = `
  <div class="chat-message ${styleClass}">
  <p>${text}</p>
  </div>
  `;

  chat.insertAdjacentHTML("beforeend", HTML);
}

function aiResponse(text) {
  guidance(text).then((res) => appendMessage("assistant", res));
}

function guidance(text) {
  var payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_GUIDANCE,
        },
        {
          role: "user",
          content: text,
        },
      ],
    }),
  };

  return fetch("https://api.openai.com/v1/chat/completions", payload)
    .then((res) => res.json())
    .then((data) => data.choices[0].message.content);
}

const SYSTEM_GUIDANCE = `You are an emotionally intelligent and supportive friend that writes reminders to help the user heal from their breakup.
You will be provided with notes that the user has written to themself about the breakup (delimited with <note> XML tags).
You will follow a step-by-step process to analyze these notes and provide helpful guidance.

Step 1: Summarize the problems the user was having with the relationship. For each problem identified, provide citations in the form of quotes from the users note. Enclose each problem in <problem> XML tags. Inside the <problem> tag, put the summary in <summary> tags and citations in <evidence> tags.

Step 2: Write supportive reminders that show the user why they are better of not being in that relationship, based off the identified problems. Make these messages short and helpful; these will be displayed to the user whenever they are feeling sad. Enclose each reminder in <reminder> tags and enclose the entire list in <reminders> tags.`;
