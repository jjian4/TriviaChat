const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

require('./db/mongoose') 
const lbRouter = require('./routers/leaderboard')
const axios = require('axios')

const { generateMessage, generateJokeMessage, generateTriviaMessage, unescapeQuestion } = require('./utils/messages')
const { addUser, removeUser, getUser, updateUser, getUsersInRoom } = require('./utils/users')
const { checkTrivia, getCategories, getCategoryId } = require('./utils/trivias')
const { updateUserRecord, updateBiggestRoom } = require('./utils/lb_updates')

const app = express()

//For the leaderboard router
app.use(express.json())
app.use(lbRouter)

//Server for socket.io
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


//Get initial leaderboard stats
let mostTriviasAsked, mostTriviasCorrect, mostJokesAsked, mostMessages, biggestRoom = 0
axios.get(process.env.LB_URL).then(function (response) {
    mostTriviasAsked = response.data.mostTriviasAsked.num
    mostTriviasCorrect = response.data.mostTriviasCorrect.num
    mostJokesAsked = response.data.mostJokesAsked.num
    mostMessages = response.data.mostMessages.num
    biggestRoom = response.data.biggestRoom.num
}).catch(function (error) {
    console.log(error)
})

    
io.on('connection', (socket) => {
    console.log('New WebSocket connection!!')

    //Helper func for updating sidebar's stats
    const updateUserStats = (user) => {
        updateUser(user)
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    }

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
        if (getUsersInRoom(user.room).length > biggestRoom) {
            biggestRoom = getUsersInRoom(user.room).length
            updateBiggestRoom(user.room)
        }

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        user.numMessagesSent += 1
        updateUserStats(user)
        if (user.numMessagesSent > mostMessages) {
            mostMessages = user.numMessagesSent
            updateUserRecord(user, mostMessages, 'mostMessages')        
        }
        callback()
    })

    socket.on('sendJoke', async (callback) => {
        const user = getUser(socket.id)
        
        const jokeMessage = await generateJokeMessage(user.username)

        io.to(user.room).emit('joke', jokeMessage)
        user.numJokesSent += 1
        updateUserStats(user)
        if (user.numJokesSent > mostJokesAsked) {
            mostJokesAsked = user.numJokesSent
            updateUserRecord(user, mostJokesAsked, 'mostJokesAsked')        
        }
        callback()
    })

    //Helper func for sending trivia message
    const sendTrivia = async (user, url) => {

        const triviaMessage = await generateTriviaMessage(user, url)
        
        io.to(user.room).emit('trivia', triviaMessage)
        user.numTriviasSent += 1
        updateUserStats(user)
        if (user.numTriviasSent > mostTriviasAsked) {
            mostTriviasAsked = user.numTriviasSent
            updateUserRecord(user, mostTriviasAsked, 'mostTriviasAsked')        
        }
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
        const {trivia, isCorrect } = checkTrivia(question, user.room, answer)
        if (isCorrect) {
            socket.emit('correct', {
                trivia
            })
            user.numTriviasCorrect += 1
            if (user.numTriviasCorrect > mostTriviasCorrect) {
                mostTriviasCorrect = user.numTriviasCorrect
                updateUserRecord(user, mostTriviasCorrect, 'mostTriviasCorrect')            
            }
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




//Initialize the leaderboard
// const lb = new Leaderboard()
// lb.save().then(() => {
//     console.log('Leaderboard')
//     console.log(lb)
// }).catch((error) => {
//     console.log('Error!', error)
// })




server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
