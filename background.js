var currentIndex = -1
var tabId;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message', request)
  if(request.type === 'start') {
    currentIndex = 0
    goToFilm(currentIndex)
  } else if (request.type === 'next') {
    currentIndex += 1
    goToFilm(currentIndex)
  } else if (request.type === 'stop') {
    sendMessage({type: 'stop'}, tabId)
    currentIndex = -1
    tabId = null
  }
})

function goToFilm(id) {
  const sequenceData = sequence[id]
  const film = films[sequenceData["Film"]]

  // tabId will be undefined the first time
  chrome.tabs.update(tabId, {
    url: film["Link"]
  }, (tab) => {
    chrome.tabs.onUpdated.addListener((updatedTabId) => {
      if (tab.id === updatedTabId) {
        // ensure tabId is now set
        tabId = tab.id
        // Send message to tab
        sendMessage({ type: 'redirected', film, sequenceData, tabId}, tabId)
      }
    })
  })


// if (tabId) {
//   chrome.tabs.query({ active: true }, (tab) => {
//     tabId = tab.id
//     updateLink(tabId)
//   })
// } else {
//   updateLink(tabId)
// }

// function updateLink(tab) {
//   chrome.tabs.update(tab, {
//     url: film["Link"]
//   }, () => {
//     chrome.tabs.onUpdated.addListener((updatedTabId) => {
//       if (tab === updatedTabId) {
//         // Send message to tab
//         sendMessage({ type: 'redirected', film, sequenceDat }, tab)
//       }
//     })
//   })
// }
}

function sendMessage(payload, toTab) {
  if (toTab) {
    console.log('Sending message to tab', toTab)
    chrome.tabs.sendMessage(toTab, payload);
  } else {
    console.log('Sending message')
    chrome.runtime.sendMessage(payload)
  }
}
