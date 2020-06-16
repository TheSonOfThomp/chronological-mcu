const startButton = document.querySelector('#start')
const resumeButton = document.querySelector('#resume')
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
resumeButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'resume'})
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
const clipId = document.querySelector('#clip-id')

/**
 * Update the popover when it opens
 */
window.onload = updatePopover()

/**
 * Hydrate the popover with the current clip data
 */
function updatePopover() {
  setButtonStyle(startButton, `images/icons/play.png`)
  setButtonStyle(resumeButton, `images/icons/play.png`)
  setButtonStyle(stopButton, `images/icons/pause.png`)
  setButtonStyle(skipButton, `images/icons/next.png`)
  setButtonStyle(prevButton, `images/icons/prev.png`)
  setButtonStyle(backButton, `images/icons/rewind.png`)

  // Tell background.js that the popover needs to be updated
  // When it responds, update the popover
  chrome.runtime.sendMessage({ type: 'popover' }, (response) => {
    console.log('Popover opened', response)
    if (response.isPlaying) {
      clipData.classList.remove('hidden')
      stopButton.classList.remove('hidden')
      backButton.classList.remove('hidden')
      startButton.classList.add('hidden')
      resumeButton.classList.add('hidden')
      filmTitle.innerText = response.film["Name"]
      clipStart.innerText = response.clip["Start"]
      clipEnd.innerText = response.clip["Stop"]
      clipId.innerText = `Clip ${response.currentIndex + 1} of ${sequence.length}`
      prevButton.classList.remove('hidden')
      skipButton.classList.remove('hidden')

      if(response.prev) {
        prevButton.setAttribute('title', `Previous: ${response.prev["Name"]}`)
      }
      if (response.next) {
        skipButton.setAttribute('title', `Next: ${response.next["Name"]}`)
      }

    } else {
      clipData.classList.add('hidden')
      skipButton.classList.add('hidden')
      stopButton.classList.add('hidden')
      prevButton.classList.add('hidden')
      backButton.classList.add('hidden')
      startButton.classList.remove('hidden')
      if (response.currentIndex >= 0) {
        resumeButton.classList.remove('hidden')
        resumeButton.setAttribute('title', `Resume from ${response.film["Name"]} (clip ${response.currentIndex})`)
      }
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
