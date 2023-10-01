console.log("content running");

// content_script.js

window.onload = function () {
  console.log("data loaded");

  chrome.runtime.sendMessage({ action: "domModified" });

  chrome.runtime.onMessage.addListener(function (
    message,
    sender,
    sendResponse
  ) {
    console.log("message Recieved");

    const h1Element = document.querySelector("h1");
    const followerCount = document.querySelectorAll(
      ".html-span xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x1hl2dhg x16tdsg8 x1vvkbs"
    );

    console.log(h1Element);
    console.log("class found");
    if (h1Element) {
      h1Element.textContent = "";
    }

    if (followerCount) {
      followerCount.textContent = "0";
    }
  });
};
