const startButton = document.querySelector('#start')
const skipButton = document.querySelector('#skip')
const stopButton = document.querySelector('#stop')
const backButton = document.querySelector('#back')
const prevButton = document.querySelector('#prev')

startButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'start'})
  window.close()
})
skipButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'next'})
  window.close()
})
stopButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'stop'})
  window.close()
})
prevButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'previous'})
  window.close()
})
backButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'back'})
  window.close()
})


const clipData = document.querySelector('#clip-data')
const filmTitle = document.querySelector('#film-title')
const clipStart = document.querySelector('#clip-start')
const clipEnd = document.querySelector('#clip-end')

window.onload = updatePopover()

function updatePopover() {
  setButtonStyle(startButton, `images/icons/play.png`)
  setButtonStyle(stopButton, `images/icons/stop.png`)
  setButtonStyle(skipButton, `images/icons/next.png`)
  setButtonStyle(prevButton, `images/icons/prev.png`)
  setButtonStyle(backButton, `images/icons/back.png`)

  chrome.runtime.sendMessage({ type: 'popover' }, (response) => {
    if (response.currentIndex >= 0) {
      clipData.classList.remove('hidden')
      skipButton.classList.remove('hidden')
      stopButton.classList.remove('hidden')
      prevButton.classList.remove('hidden')
      backButton.classList.remove('hidden')
      startButton.classList.add('hidden')
      filmTitle.innerText = response.film["Name"]
      clipStart.innerText = response.sequenceData["Start"]
      clipEnd.innerText = response.sequenceData["Stop"]
      skipButton.setAttribute('title', `Next: ${response.next}`)
    } else {
      clipData.classList.add('hidden')
      skipButton.classList.add('hidden')
      stopButton.classList.add('hidden')
      prevButton.classList.add('hidden')
      backButton.classList.add('hidden')
      startButton.classList.remove('hidden')
    }
  })
}

function setButtonStyle(button, source) {
  button.style.setProperty('background-image', `url(${chrome.runtime.getURL(source)})`)
}

// chrome.runtime.onMessage.addListener((request) => {
//   console.log('Popover received message', request)
//   if (request.type === 'update-popover') {
//     // Update UI view model
//   }
// })