var $ = document.querySelector.bind(document)
var clipTimer = null;
var videoListener = null;
var netflix_isPlayingCallback = null;

/**
 * Start listening for messages from background.js
 */
chrome.runtime.onMessage.addListener((request) => {
  console.log('Content received message', request)
  if (request.type === "clip-data") {
    onReceiveData(request.clip, request.film, request.tabId)

  } else if (request.type === 'rewind') {
    const video = document.querySelector('video')
    setClipTime(video, request.clip, request.film, request.tabId)
  
  } else if (request.type === 'stop') {
    const video = document.querySelector('video')
    video.pause()
    clearTimeout(clipTimer)
  }
});

/**
 * When the window loads, tell background.js
 */
window.onload = () => {
  chrome.runtime.sendMessage({ type: 'loaded' })
}

/**
 * When we receive data abouit the clip from background
 * we set the clip time.
 * Debounce this method so we don't recurse indefinitely.
 */
var onReceiveData = debounce(_onReceiveData, 500)
function _onReceiveData(clip, film, tabId) {
  clearTimeout(clipTimer)
  const video = document.querySelector('video')
  // if the video element exists
  if (video) {
    console.log(video)
    if (film["Link"].includes('disneyplus')) {
      videoListener = video.addEventListener('loadeddata', () => {
        setClipTime(video, clip, film, tabId)
      })
    } else if (film["Link"].includes('netflix')) {
      netflixSetClipTime(video, clip, film, tabId)
    }
  } else {
    // if the video element does not exist,
    // call this method again until it does
    onReceiveData(clip, film, tabId)
  }
}

/**
 * When the video loads set it's current time.
 * Then set the timer for the clip
 */
function setClipTime(video, clip, film, tabId) {
  clearTimeout(clipTimer)
  console.log('Loaded video')
  video.currentTime = toSeconds(clip["Start"])
  console.log(`Set video time to`, video.currentTime, `seconds`)
  setEndTimer(toMillis(clip["Clip length"]), tabId)
}

/**
 * Netflox doesn't let us set video.currentTime
 * Instead we have to spam the fastForward/rewind buttons
 * until we get to the right time
 */
function netflixSetClipTime(video, clip, film, tabId) {
  console.log('NETFLIX')
  video.removeEventListener('playing', netflix_isPlayingCallback)
  const rwButton = $('.button-nfplayerBackTen')
  const ffButton = $(".button-nfplayerFastForward")

  video.pause()
  video.play()

  netflix_isPlayingCallback = () => {
    const fastForward = debounce(() => {
      ffButton.dispatchEvent(new MouseEvent('click'))
    }, 100)

    const rewind = debounce(() => {
      rwButton.dispatchEvent(new MouseEvent('click'))
    }, 100)

    const startTime = toSeconds(clip["Start"])

    video.pause()
    if (video.currentTime < startTime - 10) {
      console.log('Fast forward', video.currentTime, startTime)
      fastForward()
    } else if (video.currentTime > startTime + 1) {
      console.log('Rewind', video.currentTime, startTime)
      rewind()
    } else {
      console.log('On time')
      video.removeEventListener('playing', netflix_isPlayingCallback)
      video.play().then(() => {
        console.log(video.currentTime)
        setEndTimer(toMillis(clip["Clip length"]), tabId)
      })
    }
  }


  video.addEventListener('playing', netflix_isPlayingCallback)
}

/**
 * Set a timer for when the clip ends
 * Tell background.js when we're ready to go to the next clip
 */
function setEndTimer(ms, tabId) {
  console.log(`Set timer for`, ms, `ms`)
  clipTimer = setTimeout(() => {
    if (clipTimer) {
      clearTimeout(clipTimer)
      clipTimer = null
    }
    console.log('Firing timer')
    // Send a message back to the background page to go to the next film
    chrome.runtime.sendMessage({ type: 'next', tabId })
  }, ms)
}

/**
 * Converts hh:mm:ss to seconds
 */
function toSeconds(timestamp) {
  const t = timestamp.split(":")
  if(t.length === 2) {
    return (parseInt(t[0]) * 60) + parseInt(t[1])
  } else if (t.length === 3) {
    return (parseInt(t[0]) * 60 * 60) + (parseInt(t[1]) * 60) + parseInt(t[2])
  }
}

/**
 * Converts hh:mm:ss to milliseconds
 */
function toMillis(timestamp) {
  return toSeconds(timestamp) * 1000
}
