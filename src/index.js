const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const fetch = require('node-fetch');
const { generateMessage, unescapeQuestion } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection!!')

    socket.on('join', ({ username, room }, callback) => {
        const {error, user} = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('TriviaChat', `Welcome, ${username}!`))
        socket.broadcast.to(user.room).emit('message', generateMessage('TriviaChat', `${user.username} has joined!`))
        
        //TODO: Update side bar
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
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

        callback()
    })

    socket.on('sendTrivia', async (callback) => {
        const user = getUser(socket.id)

        const response = await fetch('https://opentdb.com/api.php?amount=' + 1)
        const json = await response.json();
        question = unescapeQuestion(json['results'][0])

        console.log(question)

        const questionMessage = {
            username: user.username,
            question,
            createdAt: new Date().getTime()    
        }
        
        io.to(user.room).emit('trivia', questionMessage)
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('TriviaChat', `${user.username} has left!`))
       
            //TODO: Update side bar
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
