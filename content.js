var $ = document.querySelector.bind(document)
var clipTimer = null;
var videoListener = null;
var netflix_isPlayingCallback = null;

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
  videoListener = video.addEventListener('loadeddata', () => {
    console.log('Loaded video')
    video.currentTime = toSeconds(sequenceData["Start"])
    console.log(`Set video time to`, video.currentTime, `seconds`)
    setEndTimer(toMillis(sequenceData["Clip length"]), tabId)
  })

}

function netflixSetClipTime(video, sequenceData, film, tabId) {
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

    const startTime = toSeconds(sequenceData["Start"])

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
        setEndTimer(toMillis(sequenceData["Clip length"]), tabId)
      })
    }
  }


  video.addEventListener('playing', netflix_isPlayingCallback)
}

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
