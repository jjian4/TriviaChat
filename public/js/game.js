const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendJokeButton = document.querySelector('#send-joke')
const $sendTriviaButton = document.querySelector('#send-trivia')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const jokeTemplate = document.querySelector('#joke-template').innerHTML
const triviaTemplate = document.querySelector('#trivia-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options (gets the username and room queries in the url)
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Conditional autoscroll for each new message
const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    //Only autoscroll if already at the bottom
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mma')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('joke', ({ username, createdAt, joke }) => {
    const html = Mustache.render(jokeTemplate, {
        username: username,
        createdAt: moment(createdAt).format('h:mma'),
        type: joke.type,
        setup: joke.setup,
        punchline: joke.punchline
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('trivia', ({ username, createdAt, trivia, answers }) => {
    const html = Mustache.render(triviaTemplate, {
        username: username,
        createdAt: moment(createdAt).format('h:mma'),
        question: trivia.question,
        category: trivia.category,
        difficulty: trivia.difficulty,
        answers
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('correct', ({ question, answer }) => {
    alert('correct')
})

socket.on('incorrect', ({ question, correct_answer, wrong_answer }) => {
    alert('incorrect')
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

//Send Joke Question Buttton Clicked
$sendJokeButton.addEventListener('click', (e) => {
    //Disable the button until the message is sent
    $sendJokeButton.setAttribute('disabled', 'disabled')

    socket.emit('sendJoke', (error) => {
        $sendJokeButton.removeAttribute('disabled')
        if (error) {
            return console.log(error)
        }
        console.log('Joke delivered!')
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
        console.log('Trivia question delivered!')
    })
})

//Check if trivia answer is correct
const triviaAnswered = (button) => {
    const answer = button.innerText
    const question = button.parentElement.querySelector('p.trivia-question').innerText

    //Disable the buttons
    let buttons = button.parentElement.getElementsByTagName('button')
    for (let i = 0; i < buttons.length; ++i) {
        buttons[i].disabled = true
    }
    
    socket.emit('checkAnswer', {question, answer}, (error) => {
        if (error) {
            return console.log(error)
        }
        console.log('Trivia question submitted!')
    })
}



socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})