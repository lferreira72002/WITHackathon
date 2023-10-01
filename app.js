var STATE = "INTRO";
var HISTORY;
var INSTAGRAM;
var get_instagram = false;

const OPENAI_API_KEY = "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";

const form = document.querySelector("#userForm");
const input = document.querySelector("#userMessage");
const chat = document.querySelector("#chat");

const USER_ICON = "";
const ASSIST_ICON = "";

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value;
  if (!text) return;

  input.value = "";
  appendMessage("user", text);
  aiResponse(text);
});

function appendMessage(from, text) {
  const styleClass = from == "user" ? "chat-message-user" : "chat-message-ai"; // Corrected this line to handle 'assistant' case

  const waitingBubble = document.querySelector("#waitingBubble p");
  if (waitingBubble && from == "assistant") {
    waitingBubble.textContent = text;
    waitingBubble.parentElement.id = "";
  } else {
    const HTML = `
            <div class="chat-message ${styleClass} typewriter">
              <p>${text}</p>
            </div>
          `;

    chat.insertAdjacentHTML("beforeend", HTML);
  }
}

function waitBubble(add = false) {
  if (add) {
    const HTML = `
      <div class="chat-message chat-message-ai typewriter" id="waitingBubble">
      <p>Thinking...</p>
      </div>
      `;
    chat.insertAdjacentHTML("beforeend", HTML);
  } else {
    document.querySelector("#waitingBubble").innerHTML = "";
  }
}

function aiResponse(text) {
  waitBubble(true);
  console.log("State: " + STATE);

  if (get_instagram) {
    INSTAGRAM = text;
    console.log("Insta" + INSTAGRAM)
    chrome.runtime.sendMessage({ action: "Instagram", data: INSTAGRAM });
    get_instagram = false
    STATE = "INTRO"
  }

  switch(STATE) {
    case "INTRO":
      HISTORY = [
        {
          role: "system",
          content: SYS_TALK,
        },
        {
          role: "assistant",
          content: "Hi there! I see that you're going through a tough time. I'm here to support you and provide some guidance."
        },
      ]
      var user_choice;
      gpt(makeMessages(text, SYS_CHOICE), "gpt-3.5-turbo")
      .then((res) => user_choice = res)
      .then( (_) => {
        console.log("Choice: " + user_choice);
        switch(user_choice.toUpperCase()){
          case "TALK":
            gpt(makeMessages(text, SYS_TALK), "gpt-4")
            .then((res) => {
              appendMessage("assistant", res);
              addToTalkHistory(text, res);
              STATE = "TALKING";
            })
            .catch(e => appendMessage("assistant", "[Error caught! Intent: TALK State: INTRO] OpenAI probably throttled you (or something else... this is just a .catch() ) :0"))
            break;
          case "VENT":
            gpt(makeMessages(text, SYS_GUIDANCE), "gpt-4")
            .then((res) => appendMessage("assistant", res))
            .catch(e => appendMessage("assistant", "[Error caught! Intent: VENT State: INTRO] OpenAI probably throttled you (or something else... this is just a .catch() ) :0"))
            break;
          case "DETOX":
            appendMessage("assistant", "Detox? No, I don't think I will. Just go to talk and type '/next' when you're done.");
            break; 
          case "NONE":
            appendMessage("assistant", "That's not a choice idiot. Try again and do better next time.")
            break;
          default: 
            console.log(user_choice)
            appendMessage("assistant", "The 'choice' model broke...");
        }
      })
      .catch(e => appendMessage("assistant", "[Error caught! Intent: CHOICE State: INTRO] OpenAI probably throttled you (or something else... this is just a .catch() ) :0"))
    break;

    case "TALKING":
      if (text == "/next") {
        get_instagram = true;
        appendMessage("assistant", "Let's move on. Can you paste their Instagram username into the chat?");
      } else {
      addToTalkHistory(text, "user");
      gpt(HISTORY, "gpt-4")
            .then((res) => {
              appendMessage("assistant", res);
              addToTalkHistory(res, "assistant");
            })
            .catch(e => appendMessage("assistant", "[Error caught! Intent: TALK State: TALKING] OpenAI probably throttled you (or something else... this is just a .catch() ) :0"))
    }
    break;
  }
}

function makeMessages(sys, text) {
  return [
    {
      role: "system",
      content: sys,
    },
    {
      role: "user",
      content: text,
    },
  ]
}

function addToTalkHistory(text, role) {
  HISTORY.push({
    role: role,
    content: text,
  })
  return HISTORY;
}

function gpt(messages, model, ) {
  var payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
    }),
  };
  return fetch("https://api.openai.com/v1/chat/completions", payload)
    .then((res) => res.json())
    .then((data) => data.choices[0].message.content)
    .then((data) => {
      return data;
    });
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
1. TALK: Talk through the situation.
2. VENT: Upload (dump) a note that contains details about your breakup.   
3. DETOX: Block your ex's profile (digital detox).
Based on the context of the user's message, respond ONLY with the word: "TALK", "VENT", or "DETOX". If none of these categories apply to their message, respond with the word "NONE".`

const SYS_TALK = `Hold a conversation where you guide your friend (the user) who has recently experienced a breakup through a deep and meaningful conversation. Guide them to express things they didn't like about the relationship while they were in it. To achieve this, ask lots of questions with the intention of getting the user to open up about the situation. Keep a friendly tone throughout the conversation, while keeping your responses simple and as succinct as possible.`
