chrome.action.onClicked.addListener(function (tab) {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['combined.js']
  });

  chrome.scripting.insertCSS({
    target: {tabId: tab.id},
    files: ['combined.css']
  });
});
