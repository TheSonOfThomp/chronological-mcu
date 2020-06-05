const startButton = document.querySelector('#start')
const skipButton = document.querySelector('#skip')
const stopButton = document.querySelector('#stop')

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


const clipData = document.querySelector('#clip-data')
const filmTitle = document.querySelector('#film-title')
const clipStart = document.querySelector('#clip-start')
const clipEnd = document.querySelector('#clip-end')

window.onload = updatePopover()

function updatePopover() {
  chrome.runtime.sendMessage({ type: 'popover' }, (response) => {
    if (response.currentIndex >= 0) {
      clipData.classList.remove('hidden')
      skipButton.classList.remove('hidden')
      stopButton.classList.remove('hidden')
      startButton.classList.add('hidden')
      filmTitle.innerText = response.film["Name"]
      clipStart.innerText = response.sequenceData["Start"]
      clipEnd.innerText = response.sequenceData["Stop"]
    } else {
      clipData.classList.add('hidden')
      skipButton.classList.add('hidden')
      stopButton.classList.add('hidden')
      startButton.classList.remove('hidden')
    }
  })
}

// chrome.runtime.onMessage.addListener((request) => {
//   console.log('Popover received message', request)
//   if (request.type === 'update-popover') {
//     // Update UI view model
//   }
// })