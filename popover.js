const filmTitle = document.querySelector('#film-title')
const playButton = document.querySelector('#play')
const skipButton = document.querySelector('#skip')
const stopButton = document.querySelector('#stop')

playButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'start'})
})
skipButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'next'})
})
stopButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'stop'})
})

// window.onload = () => {
//   chrome.runtime.sendMessage({ type: 'request-status'}, (response) => {
//     console.log(response)
//     if (response.currentIndex > 0) {
//       viewModel.title = response.film["Name"]
//     }
//   })
// }

// chrome.runtime.onMessage.addListener((request) => {
//   console.log('Popover received message', request)
//   if (request.type === 'update-popover') {
//     // Update UI view model
//   }
// })



var viewModel = {
  _title: '',

  get title() {
    return this._title
  },
  set title(newTitle) {
    this._title = newTitle
    filmTitle.innerText = newTitle
  }
}