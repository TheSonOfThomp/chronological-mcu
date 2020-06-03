var currentIndex = -1

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message', request)
  if(request.type === 'start') {
    currentIndex = 0
    goToFilm(currentIndex)
  } else if (request.type === 'next') {
    currentIndex += 1
    goToFilm(currentIndex)
  }
})

function goToFilm(id) {
  const sequenceData = sequence[id]
  const film = films[sequenceData["Film"]]

  // TODO - update the same tab every time
  // Pass the same tab id with the redirect & next events
  chrome.tabs.update({
    url: film["Link"]
  }, (tab) => {
    chrome.tabs.onUpdated.addListener((tabId, newTab) => {
      if (tab.id === tabId) {
        // Send message to tab
        sendMessage({ type: 'redirected', film, sequenceData }, tabId)
      }
    })
  })
}

function sendMessage(payload, toTab) {
  if (toTab) {
    console.log('Sending message to tab', toTab)
    chrome.tabs.sendMessage(toTab, payload);
  } else {
    chrome.runtime.sendMessage(payload)
  }
}