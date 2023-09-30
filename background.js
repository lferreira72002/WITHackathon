chrome.runtime.onInstalled.addListener(() => {
    console.log("Background working!")
    });



chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
  
        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            var tab = tabs[0];
        
            if (tab && tab.url.startsWith("http://") || tab.url.startsWith("https://")) {
        
                console.log(tab.url);
        
                if (tab.url === "https://www.instagram.com/kateewrightt/") {
        
                chrome.scripting.insertCSS({
                    files: ["hideImages.css"],
                    target: {tabId: tab.id}
                });

                chrome.browserAction.setPopup({popup: "onInsta.html"});
        
                } else {
        
                chrome.scripting.removeCSS({
                    files: ["hideImages.css"],
                    target: {tabId: tab.id}
                    });
        
                };
            };
        });
  
    }
  })