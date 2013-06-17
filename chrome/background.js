chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.insertCSS(tab.id, { file: "combined.css" });
  chrome.tabs.executeScript(tab.id, { file: "combined.js" });
});
