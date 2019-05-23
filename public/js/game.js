const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendQuestionButton = document.querySelector('#send-question')
const $messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const questionTemplate = document.querySelector('#question-template').innerHTML

//Options (gets the username and room queries in the url)
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mma')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    // autoscroll()
})

socket.on('question', (questionMessage) => {
    console.log('hi', questionMessage)
})

//Send Message Button Clicked
$messageForm.addEventListener('submit', (e) => {
    //Prevent auto page refresh when form is submitted
    e.preventDefault()
    //Disable the button until the message is sent
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

//Send Trivia Question Buttton Clicked
$sendQuestionButton.addEventListener('click', (e) => {
    //Disable the button until the message is sent
    $sendQuestionButton.setAttribute('disabled', 'disabled')

    socket.emit('sendQuestion', (error) => {
        $sendQuestionButton.removeAttribute('disabled')
        if (error) {
            return console.log(error)
        }
        console.log('Question delivered!')
    })
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})