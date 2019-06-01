const Filter = require('bad-words')

const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    //Validate data
    if (!username || !room) {
        return { error: 'Username and room are required.' }
    }

    //Check for profanity
    filter = new Filter()
    if (filter.isProfane(username)) {
        return { error: 'Username is not allowed.' }
    }
    if (filter.isProfane(room)) {
        return { error: 'Room name is not allowed.' }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    //Validate username
    if (existingUser) {
        return { error: 'Username is in use.' }
    }

    //Store user
    const user = { 
        id, 
        username, 
        room,
        numMessagesSent: 0,
        numJokesSent: 0,
        numTriviasSent: 0,
        numTriviasAnswered: 0,
        numTriviasCorrect: 0
    }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const updateUser = (updatedUser) => {
    const index = users.findIndex((user) => user.id === updatedUser.id)
    users.splice(index, 1, updatedUser)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    updateUser,
    getUsersInRoom
}