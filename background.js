
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background working!");
});


// background.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  console.log("Data received " + request.data);


  if (request.action === "Instagram") {
    INSTAUSER = request.data;

    // Now you can use the received variable in your background script
    console.log("Received data:", INSTAUSER);
    // Perform any further processing as needed
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
      var tab = tabs[0];

  
      if (tab && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
        console.log(tab.url);

        url = "https://www.instagram.com/" + INSTAUSER + "/"; // Replace 'receivedData' with your actual data

        console.log(url);

        if (tab.url === url) {
          console.log("URL detected");
          const message = {action: "modifyText", data: "New text"}

          chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
              if (message.action === "domModified") {

          chrome.tabs.sendMessage(tab.id, message)

              }
          });
          console.log("Message sent")

          console.log("CSS Active");

          chrome.tabs.insertCSS(tab.id, { file: "hideImages.css" }, function () {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            }
          });
        } else {
          chrome.tabs.removeCSS(tab.id, { file: "hideImages.css" }, function () {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            }
          });
        }
      }
    });
  }
});

