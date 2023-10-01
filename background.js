
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background working!");


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
      var tab = tabs[0];

  
      if (tab && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
        console.log(tab.url);

        let url = "https://www.instagram.com/kateewrightt/"; // Replace 'receivedData' with your actual data

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
});
