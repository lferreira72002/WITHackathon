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
            STATE = "VENTING";
            appendMessage("assistant", "Awesome. Dump your vent in the chat! ");
            break;

          case "DETOX":
            STATE = "GETTINGAT"
            appendMessage("assistant", "Let's move on. Can you paste their Instagram username into the chat?");
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
      if (text == "/back") {
        appendMessage("assistant", "What do you want to do?");
        STATE = "INTRO";
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

    case "VENTING":
      if (text == "/back") {
        appendMessage("assistant", "What do you want to do?");
        STATE = "INTRO";
      } else {
      gpt(makeMessages(text, SYS_GUIDANCE), "gpt-4")
      .then((res) => appendMessage("assistant", res))
      .catch(e => appendMessage("assistant", "[Error caught! Intent: VENT State: INTRO] OpenAI probably throttled you (or something else... this is just a .catch() ) :0"));
      }
    break;

    case "GETTINGAT":
      INSTAGRAM = text;
      chrome.runtime.sendMessage({ action: "Instagram", data: INSTAGRAM });
      console.log("Instagram: " + INSTAGRAM)
      appendMessage("assistant", "Wonderful. Problem solved ;)");
      STATE = "INTRO"
      break;
    
    default:
      console.log("No case hit!");
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
You will be provided with notes that the user has written to themself about the breakup.
You will follow a step-by-step process to analyze these notes and provide helpful guidance.

Step 1: Summarize the problems the user was having with the relationship. For each problem identified, provide citations in the form of quotes from the users note. Prefix each problem in with the word "Problem:". For each problem, prefix the summary with "Summary:" and citations with "Evidence:".

Step 2: Write supportive reminders that show the user why they are better of not being in that relationship, based off the identified problems. Make these messages short and helpful; these will be displayed to the user whenever they are feeling sad. Prefix each reminder with "Reminder:" and prefix the entire list with "Reminders:".`;

const SYS_CHOICE = `Your task as an AI is to analyze the user's message to identify their needs. They could be:
1. TALK: Talk through the situation.
2. VENT: Upload (dump) a note that contains details about your breakup.   
3. DETOX: Block your ex's profile (digital detox).
Based on the context of the user's message, respond ONLY with the word: "TALK", "VENT", or "DETOX". If none of these categories apply to their message, respond with the word "NONE".`

const SYS_TALK = `Hold a conversation where you guide your friend (the user) who has recently experienced a breakup through a deep and meaningful conversation. Guide them to express things they didn't like about the relationship while they were in it. To achieve this, ask lots of questions with the intention of getting the user to open up about the situation. Keep a friendly tone throughout the conversation, while keeping your responses simple and as succinct as possible.`
