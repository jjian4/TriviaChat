const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendJokeButton = document.querySelector('#send-joke')
const $sendTriviaButton = document.querySelector('#send-trivia')
const $messages = document.querySelector('#messages')

const $triviaModalTitle = document.querySelector('#trivia-modal-title')
const $triviaModalBody = document.querySelector('#trivia-modal-body')

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

socket.on('fillCategories', (categories) => {
    const dropup = document.getElementById('trivia-dropup')
    for (let i = 0; i < categories.length; ++i) {
        const a = document.createElement('a')
        a.setAttribute('class', 'dropdown-item');
        a.setAttribute('onclick', 'sendTriviaCategory(this)')
        a.innerHTML = categories[i].name
        dropup.append(a)
    }
})

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
        answers
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('correct', ({ trivia }) => {
    console.log(trivia.question)
    // $triviaModalTitle.innerHTML = 'Correct!!!'
    $triviaModalBody.innerHTML = `
        <h5 class='col-12'>${trivia.question}</h5>
        <div class='col-6'>${trivia.category}</div>
        <div class='col-6'>Difficulty: ${trivia.difficulty}</div>
        <div class='trivia-correct col-12'>Answer: ${trivia.correct_answer} (Correct)</div>
    `
    $('#trivia-modal').modal('show');
})

socket.on('incorrect', ({ trivia, wrong_answer }) => {
    console.log(trivia.question)
    console.log(trivia.correct_answer)
    console.log(wrong_answer)
    // $triviaModalTitle.innerHTML = 'Incorrect...'
    $triviaModalBody.innerHTML = `
        <h5 class='col-12'>${trivia.question}</h5>
        <div class='col-6'>${trivia.category}</div>
        <div class='col-6'>Difficulty: ${trivia.difficulty}</div>
        <div class='trivia-correct col-12'>Correct Answer: ${trivia.correct_answer}</div>
        <div class='trivia-incorrect col-12'>Your Answer: ${wrong_answer}</div>
    `
    $('#trivia-modal').modal('show');
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

//Remove button and show the joke punchline underneath
const showPunchline = (button) => {
    button.style.display = 'none'
    const $punchline = button.parentElement.querySelector('span.joke-punchline')
    $punchline.style.display = 'block'
}

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

//Send Trivia Category Question Clicked
const sendTriviaCategory = (category) => {
    socket.emit('sendTriviaCategory', category.innerText, (error) => {
        if (error) {
            return console.log(error)
        }
        console.log('Trivia question w/ category delivered!')
    })
}

//Check if trivia answer is correct
const triviaAnswered = (button) => {
    const answer = button.innerText
    const question = button.parentElement.parentElement.querySelector('span.trivia-question').innerText

    //Disable the buttons
    let buttons = button.parentElement.getElementsByTagName('button')
    for (let i = 0; i < buttons.length; ++i) {
        buttons[i].disabled = true
    }
    
    socket.emit('checkAnswer', {question, answer}, (error) => {
        if (error) {
            return console.log(error)
        }
        console.log('Trivia answer submitted!')
    })
}

//Close the trivia modal with space
$(window).keypress(function (e) {
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        $('#trivia-modal').modal('hide');
    }    
})
  

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})