var pageLoadCheckTimeout;
var clipTimer;

chrome.runtime.onMessage.addListener((request) => {
  console.log('Content received message', request)
  if (request.type === "redirected") {
    onRedirect(request.film, request.sequenceData)
  }
});

var onRedirect = debounce(_onRedirect, 100)

function _onRedirect(film, sequenceData) {
  clearTimeout(clipTimer)
  const video = document.querySelector('video')
  if (video) {
    console.log(video)
    video.currentTime = toSeconds(sequenceData["Start"])
    console.log(`Set video time to ${video.currentTime}s`)

    // Send a message back to the background page to go to the next film
    clipTimer = setTimeout(() => {
      console.log('Firing timer')
      chrome.runtime.sendMessage({type: 'next'})
    }, toMillis(sequenceData["Clip length"]))
  } else {
    onRedirect(film, sequenceData)
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
