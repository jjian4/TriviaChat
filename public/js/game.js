const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendTriviaButton = document.querySelector('#send-trivia')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const questionTemplate = document.querySelector('#question-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

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

socket.on('question', ({ username, createdAt, question }) => {
    console.log(question.question)
    const html = Mustache.render(questionTemplate, {
        username: username,
        createdAt: moment(createdAt).format('h:mma'),
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
        correct: question.correct_answer,
        incorrect_0: question.incorrect_answers[0],
        incorrect_1: question.incorrect_answers[1],
        incorrect_2: question.incorrect_answers[2],
    })
    $messages.insertAdjacentHTML('beforeend', html)
    // autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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
$sendTriviaButton.addEventListener('click', (e) => {
    //Disable the button until the message is sent
    $sendTriviaButton.setAttribute('disabled', 'disabled')

    socket.emit('sendTrivia', (error) => {
        $sendTriviaButton.removeAttribute('disabled')
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