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
const LOCALSTORAGE_KEY = 'mcuIndex'
const PING_DELAY = 1000
var pingTimer;
var isPlaying = false
var currentIndex = -1
var tabId;
var incrementCurrentIndex = () => { 
  currentIndex += 1
  const { film } = getFilmClip(currentIndex)
  if(film && film["Link"]) return
  else incrementCurrentIndex()
}
var decrementCurrentIndex = () => { 
  currentIndex -= 1
  const { film } = getFilmClip(currentIndex)
  if(film && film["Link"]) return
  else decrementCurrentIndex()
}
var isIncluded = (film) => !SKIP_FILMS.includes(film["Name"])
// var incrementCurrentIndex = throttle(_incrementCurrentIndex, 500, {leading: true})

/**
 * Start listening for messages from content.js or popover.js
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message', request)

  if(request.type === 'start') {
    // Set the current index, and go to it's url
    isPlaying = true;
    currentIndex = 0 
    goToFilm(currentIndex)

  } else if (request.type === 'resume') {
    isPlaying = true
    console.log(localStorage)
    currentIndex = localStorage[LOCALSTORAGE_KEY] || 0
    goToFilm(currentIndex)

  } else if(request.type === 'loaded') {
    // content.js sends a message onload. 
    // When we get this message, send back the clip data
    console.log('Page loaded')
    sendClipData(currentIndex)
    startPing()

  } else if (request.type === 'next') {
    // When the client says it's time to move on
    // we set the url to the next clip in the sequence.filter()
    incrementCurrentIndex()
    goToFilm(currentIndex)

  } else if (request.type === 'back') {
    // If the popover wants to restart the clip, we send that on to the client
    const { film, clip } = getFilmClip(currentIndex)
    sendMessage({ type: 'rewind', currentIndex, tabId, clip, film}, tabId)

  } else if (request.type === 'previous') {
    // When the user presses previous, go to the prev clip
    decrementCurrentIndex()
    goToFilm(currentIndex)

  } else if (request.type === 'stop') {
    // If the popover wants to stop, we sent that to the client
    isPlaying = false
    localStorage[LOCALSTORAGE_KEY] = currentIndex
    sendMessage({type: 'stop'}, tabId)
    tabId = null

  } else if (request.type === 'popover') {
    // When the popover loads, 
    // sent it data about the current clip & film
    const { film, clip } = getFilmClip(currentIndex)
    let next = getFilmClip(currentIndex + 1)
    let prev = getFilmClip(currentIndex - 1)
    sendResponse({ currentIndex, film, clip, isPlaying, next: next.film, prev: prev.film })
  } else if (request.type === 'ping') {
    pingTimer = setTimeout(() => {
      sendMessage({type: 'pong'}, tabId)
      clearTimeout(pingTimer)
    }, PING_DELAY);
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
    // commPort = chrome.tabs.connect(tabId, { name: PORT_NAME})
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
  const clip = index >= 0 ? sequence.filter(isIncluded)[index] : null
  const film = clip ? films[clip["Film"]] || null : null
  return {film, clip}
}

/**
 * Send a chrome message
 */
function sendMessage(payload, toTab = null) {
  if (toTab) {
    if (payload.type !== 'pong') console.log('Sending message to tab', toTab, payload)
    chrome.tabs.sendMessage(toTab, payload);
  } else {
    console.log('Sending message')
    chrome.runtime.sendMessage(payload)
  }
}

function startPing () {
  clearTimeout(pingTimer)
  sendMessage({ type: 'ping' }, tabId)
}
