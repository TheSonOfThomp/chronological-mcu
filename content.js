var $ = document.querySelector.bind(document)
var $$ = document.querySelector.bind(document)
var clipTimer;

chrome.runtime.onMessage.addListener((request) => {
  console.log('Content received message', request)
  if (request.type === "redirected") {
    onRedirect(request.sequenceData, request.film, request.tabId)
  } else if (request.type === 'reset-clip') {
    const video = document.querySelector('video')
    setClipTime(video, request.sequenceData, request.film, request.tabId)
  } else if (request.type === 'stop') {
    const video = document.querySelector('video')
    video.pause()
    clearTimeout(clipTimer)
  }
});

var onRedirect = debounce(_onRedirect, 100)

function _onRedirect(sequenceData, film, tabId) {
  clearTimeout(clipTimer)
  const video = document.querySelector('video')
  if (video) {
    console.log(video)
    if (film["Link"].includes('disneyplus')) {
      setClipTime(video, sequenceData, film, tabId)
    } else if (film["Link"].includes('netflix')) {
      netflixSetClipTime(video, sequenceData, film, tabId)
    }

  } else {
    onRedirect(sequenceData, film, tabId)
  }
}

function setClipTime(video, sequenceData, film, tabId) {
  clearTimeout(clipTimer)
  video.addEventListener('loadeddata', () => {
    console.log('Loaded video')
    video.currentTime = toSeconds(sequenceData["Start"])
    console.log(`Set video time to`, video.currentTime, `seconds`)
    setEndTimer(toMillis(sequenceData["Clip length"]), tabId)
  })

}

function netflixSetClipTime(video, sequenceData, film, tabId) {
  console.log('NETFLIX')
  const rwButton = $('.button-nfplayerBackTen')
  const ffButton = $(".button-nfplayerFastForward")
  var canplayListener;
  
  const skip = () => {
    if(canplayListener) {
      console.log('Removing listener')
      // prevents recursively adding more listeners
      video.removeEventListenter('canplay', canplayListener)
    }
    console.log(video.currentTime)
    if (video.currentTime < toSeconds(sequenceData["Start"]) - 10) {
      ffButton.dispatchEvent(new MouseEvent('click'))
      console.log('Fast forward')
      canplayListener = video.addEventListener('canplay', skip)
    } else if (video.currentTime > toSeconds(sequenceData["Start"])) {
      rwButton.dispatchEvent(new MouseEvent('click'))
      console.log('Rewind')
      canplayListener = video.addEventListener('canplay', skip)
    } else {
      setEndTimer(toMillis(sequenceData["Clip length"]), tabId)
    }
  }

  skip()
}

function setEndTimer(ms, tabId) {
  console.log(`Set timer for`, ms, `ms`)
  clipTimer = setTimeout(() => {
    console.log('Firing timer')
    // Send a message back to the background page to go to the next film
    chrome.runtime.sendMessage({ type: 'next', tabId })
  }, ms)
}

function toSeconds(timestamp) {
  const t = timestamp.split(":")
  if(t.length === 2) {
    return (parseInt(t[0]) * 60) + parseInt(t[1])
  } else if (t.length === 3) {
    return (parseInt(t[0]) * 60 * 60) + (parseInt(t[1]) * 60) + parseInt(t[2])
  }
}

function toMillis(timestamp) {
  return toSeconds(timestamp) * 1000
}