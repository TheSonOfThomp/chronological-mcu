const startButton = document.querySelector('#start')
const skipButton = document.querySelector('#skip')
const stopButton = document.querySelector('#stop')
const backButton = document.querySelector('#back')
const prevButton = document.querySelector('#prev')

/**
 * Listen to clicks on all the buttons
 */
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

/**
 * Update the popover when it opens
 */
window.onload = updatePopover()

/**
 * Hydrate the popover with the current clip data
 */
function updatePopover() {
  setButtonStyle(startButton, `images/icons/play.png`)
  setButtonStyle(stopButton, `images/icons/stop.png`)
  setButtonStyle(skipButton, `images/icons/next.png`)
  setButtonStyle(prevButton, `images/icons/prev.png`)
  setButtonStyle(backButton, `images/icons/back.png`)

  // Tell background.js that the popover needs to be updated
  // When it responds, update the popover
  chrome.runtime.sendMessage({ type: 'popover' }, (response) => {
    if (response.currentIndex >= 0) {
      clipData.classList.remove('hidden')
      skipButton.classList.remove('hidden')
      stopButton.classList.remove('hidden')
      prevButton.classList.remove('hidden')
      backButton.classList.remove('hidden')
      startButton.classList.add('hidden')
      filmTitle.innerText = response.film["Name"]
      clipStart.innerText = response.clip["Start"]
      clipEnd.innerText = response.clip["Stop"]
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

/**
 * We need to get the static urls of our assets from here
 * Set the bg image of the buttons 
 */
function setButtonStyle(button, source) {
  button.style.setProperty('background-image', `url(${chrome.runtime.getURL(source)})`)
}
