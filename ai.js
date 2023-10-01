require("dotenv").config();
const { OpenAI } = require("openai");
const aiConst = require("./aiConst.js");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function intro() {
  const MSG_INTRO = `Hey, I heard you've been through a breakup.`;
  const MSG_CHOICE = `Where can we start?`;
  const MSG_OPTIONS = `    > Vent
    > Get helpful reminders
    > Hide their profile`; // choice color
  console.log(MSG_INTRO);
  console.log(MSG_CHOICE);
  console.log(MSG_OPTIONS);
}

async function guidance() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: aiConst.SYSTEM_GUIDANCE },
      { role: "user", content: "My ex killed my cat" },
    ],
    model: "gpt-4",
  });

  console.log(completion.choices[0].message.content);
}

async function main() {
  intro();
}

main();

fetch("https://api.openai.com/v1/chat/completions", payload);

var payload = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer $OPENAI_API_KEY",
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: "Hello!",
      },
    ],
  }),
};

var l = `
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'
  `;
