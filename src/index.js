const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const fetch = require('node-fetch')
const shuffle = require('shuffle-array')
const { generateMessage, unescapeQuestion } = require('./utils/messages')
const { addUser, removeUser, getUser, updateUser, getUsersInRoom } = require('./utils/users')
const { addTrivia, getTrivia, removeTrivia, getCategories, getCategoryId } = require('./utils/trivias')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


const updateUserStats = (user) => {
    updateUser(user)
    io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
    })
}


io.on('connection', (socket) => {
    console.log('New WebSocket connection!!')

    socket.on('join', async ({ username, room }, callback) => {
        const {error, user} = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('TriviaChat', `Welcome, ${username}!`))
        socket.broadcast.to(user.room).emit('message', generateMessage('TriviaChat', `${user.username} has joined!`))
        
        //Fetch trivia categories and fill the dropup menu
        const categories = await getCategories()
        socket.emit('fillCategories', categories)

        //Update side bar
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        user.numMessagesSent += 1
        updateUserStats(user)
        callback()
    })

    socket.on('sendJoke', async (callback) => {
        const user = getUser(socket.id)
        
        const response = await fetch('https://official-joke-api.appspot.com/random_joke')
        const joke = await response.json();
        
        console.log(joke)

        const jokeMessage = {
            username: user.username,
            joke,
            createdAt: new Date().getTime()    
        }

        io.to(user.room).emit('joke', jokeMessage)
        user.numJokesSent += 1
        updateUserStats(user)
        callback()
    })

    const sendTrivia = async (user, url) => {
        const response = await fetch(url)
        const json = await response.json();
        let trivia = unescapeQuestion(json['results'][0])

        console.log(trivia)
        addTrivia(trivia, user.room)

        let answers = []
        trivia.incorrect_answers.forEach(ans => {
            answers.push(ans)
        });
        answers.push(trivia.correct_answer)
        shuffle(answers)

        const triviaMessage = {
            username: user.username,
            trivia,
            answers,
            createdAt: new Date().getTime()    
        }
        
        io.to(user.room).emit('trivia', triviaMessage)
        user.numTriviasSent += 1
        updateUserStats(user)
    }
    socket.on('sendTrivia', async (callback) => {
        const user = getUser(socket.id)
        await sendTrivia(user, 'https://opentdb.com/api.php?amount=1')
        callback()
    })
    socket.on('sendTriviaCategory', async (categoryName, callback) => {
        const user = getUser(socket.id)
        console.log(categoryName)
        const id = getCategoryId(categoryName)
        console.log(id)
        await sendTrivia(user, 'https://opentdb.com/api.php?amount=1&category=' + id)
        callback()
    })

    socket.on('checkAnswer', ({question, answer}, callback) => {
        const user = getUser(socket.id)
        const trivia = getTrivia(question, user.room)
        if (trivia.correct_answer === answer) {
            socket.emit('correct', {
                trivia
            })
            user.numTriviasCorrect += 1
        }
        else {
            socket.emit('incorrect', {
                trivia,
                wrong_answer: answer
            })
        }

        user.numTriviasAnswered += 1
        updateUserStats(user)

        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('TriviaChat', `${user.username} has left!`))
       
            //Update side bar
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})




server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
