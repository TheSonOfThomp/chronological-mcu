var clipTimer;

chrome.runtime.onMessage.addListener((request) => {
  console.log('Content received message', request)
  if (request.type === "redirected") {
    onRedirect(request.film, request.sequenceData, request.tabId)
  } else if (request.type === 'stop') {
    const video = document.querySelector('video')
    video.pause()
    clearTimeout(clipTimer)
  }
});

var onRedirect = debounce(_onRedirect, 100)

function _onRedirect(film, sequenceData, tabId) {
  clearTimeout(clipTimer)
  const video = document.querySelector('video')
  if (video) {
    console.log(video)
    video.addEventListener('loadeddata', () => {
      console.log('Loaded video')
      video.currentTime = toSeconds(sequenceData["Start"])
      console.log(`Set video time to`, video.currentTime, `seconds`)
      console.log(`Set timer for`, toMillis(sequenceData["Clip length"]), `ms`)
      clipTimer = setTimeout(() => {
        console.log('Firing timer')
        // Send a message back to the background page to go to the next film
        chrome.runtime.sendMessage({ type: 'next', tabId})
      }, toMillis(sequenceData["Clip length"]))
    })
  } else {
    onRedirect(film, sequenceData, tabId)
  }
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
