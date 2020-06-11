chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostContains: 'disneyplus|netflix' },
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

const SKIP_FILMS = ["INCREDIBLE_HULK", "SPIDERMAN_FAR_FROM_HOME"]
var currentIndex = -1
var tabId;
var incrementCurrentIndex = () => { currentIndex += 1 }
// var incrementCurrentIndex = throttle(_incrementCurrentIndex, 500, {leading: true})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message', request)

  if(request.type === 'start') {
    // Set the current index, and go to it's url
    currentIndex = 0 
    goToFilm(currentIndex)
  } else if(request.type === 'loaded') {
    // content.js sends a message onload. 
    // When we get this message, send back the clip data
    console.log('Page loaded')
    sendClipData(currentIndex)
  } else if (request.type === 'next') {
    // When the client says it's time to move on
    // we set the url to the next clip in the sequence
    incrementCurrentIndex()
    if (SKIP_FILMS.includes(sequence[currentIndex]["Film"])) {
      incrementCurrentIndex()
    }
    goToFilm(currentIndex)
  } else if (request.type === 'back') {
    // If the popover wants to restart, we send that on to the client
    sendMessage({ type: 'reset-clip', sequenceData: sequence[currentIndex], tabId , film}, tabId)
  } else if (request.type === 'stop') {
    // If the popover wants to stop, we sent that to the client
    sendMessage({type: 'stop'}, tabId)
    currentIndex = -1
    tabId = null
  } else if (request.type === 'popover') {
    // When the popover loads, 
    // sent it data about the current clip & film
    const { film, clip } = getFilmClip(currentIndex)
    const nextClip = currentIndex >= 0 ? sequence[currentIndex + 1] : null
    const next = nextClip ? films[nextClip["Film"]]["Name"] || null : null
    sendResponse({ currentIndex, film, clip, next})
  }
})

/**
 * Redirect the player tab to the film's url
 */
function goToFilm(index) {
  const { film } = getFilmClip(index)
  // tabId will be undefined the first time
  chrome.tabs.update(tabId, {
    url: film["Link"]
  }, (tab) => {
    tabId = tab.id
    console.log('Updated url. Tab:', tabId)
  })
}

/**
 * Send data about the clip to the client
 */
function sendClipData(index) {
  const { film, clip } = getFilmClip(index)
  sendMessage({ type: 'clip-data', film, clip, tabId}, tabId)
}

/**
 * Return the film and clip data for the current clip
 */
function getFilmClip(index) {
  const clip = index >= 0 ? sequence[index] : null
  const film = clip ? films[clip["Film"]] || null : null
  return {film, clip}
}

/**
 * Send a chrome message
 */
function sendMessage(payload, toTab = null) {
  if (toTab) {
    console.log('Sending message to tab', toTab, payload)
    chrome.tabs.sendMessage(toTab, payload);
  } else {
    console.log('Sending message')
    chrome.runtime.sendMessage(payload)
  }
}
