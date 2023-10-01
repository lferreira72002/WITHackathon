var STATE = "INTRO";

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

  orm.addEventListener("submit", (event) => {
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

function waitBubble(add = false){
  if (add) {
    const HTML = `
    <div class="chat-message chat-message-ai id="waitingBubble">
    <p>...</p>
    </div>
    `;
    chat.insertAdjacentHTML("beforeend", HTML);
  } else {
    document.querySelector("#waitingbubble").innerHTML = ""
  }

}

function aiResponse(text) {
  switch(STATE) {
    case "INTRO":
      var user_choice;
      gpt(text, "gpt-3.5-turbo", SYS_CHOICE)
      .then((res) => user_choice = res)
      .then( () => {
        switch(user_choice){
          case "TALK":
            gpt(text, "gpt-4", SYS_TALK).then((res) => appendMessage("assistant", res));
            break;
          case "VENT":
            gpt(text, "gpt-4", SYS_GUIDANCE).then((res) => appendMessage("assistant", res));
            break;
          case "DETOX":
            break; 
          case "NONE":
            appendMessage("assistant", "That's not a choice idiot. Try again and do better next time.")
            break;
          default: 
            appendMessage("assistant", "The 'choice' model broke...");
        }
      })
    break;

    case "TALKING":
    break;
  }

  
}

function gpt(text, model, sys) {
  waitBubble(true)
  var payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: sys,
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
    .then((data) => data.choices[0].message.content)
    .then((data) => {
      waitBubble(false)
      return data
    })
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
          content: SYS_GUIDANCE,
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

function choice(text) {
  var payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SYS_CHOICE,
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

const SYS_GUIDANCE = `You are an emotionally intelligent and supportive friend that writes reminders to help the user heal from their breakup.
You will be provided with notes that the user has written to themself about the breakup (delimited with <note> XML tags).
You will follow a step-by-step process to analyze these notes and provide helpful guidance.

Step 1: Summarize the problems the user was having with the relationship. For each problem identified, provide citations in the form of quotes from the users note. Enclose each problem in <problem> XML tags. Inside the <problem> tag, put the summary in <summary> tags and citations in <evidence> tags.

Step 2: Write supportive reminders that show the user why they are better of not being in that relationship, based off the identified problems. Make these messages short and helpful; these will be displayed to the user whenever they are feeling sad. Enclose each reminder in <reminder> tags and enclose the entire list in <reminders> tags.`;


const SYS_CHOICE = `Your task as an AI is to analyze the user's message to identify their needs. They could be:
1. TALK: Talking it out.
2. VENT: Dumping your vent
3. DETOX: Digital detox
Based on the context of the user's message, respond with: "TALK", "VENT", "DETOX". If none of these categories apply to their message, respond with "NONE".`

const SYS_TALK = `Start a conversation where you lend emotional support to the user, who has recently experienced a breakup. Encourage them to express their feelings about the relationship and its ending. As a supportive companion, offer them guidance based upon their emotions and situation. Keep a friendly tone throughout the conversation.`