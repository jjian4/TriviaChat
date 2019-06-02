const axios = require('axios')
const { getUsersInRoom } = require('./users')

const url = process.env.LB_URL


const updateUserRecord = (user, newNum, key) => {
    axios.patch(url, {
        [key]: {
            username: user.username,
            room: user.room,
            updatedAt: new Date().getTime(),
            num: newNum
        }
    }).then(function (response) {
        console.log("Leaderboard Update: " + key)
        console.log(response.data[key])
    }).catch(function (error) {
        console.log(error);
    })
}

const updateBiggestRoom = (room) => {
    const users = getUsersInRoom(room)
    let usernames = []
    users.forEach(user => {
        usernames.push(user.username)
    });
    axios.patch(url, {
        biggestRoom: {
            usernames,
            room,
            updatedAt: new Date().getTime(),
            num: users.length
        }
    }).then(function (response) {
        console.log("Leaderboard Update: biggestRoom")
        console.log(response.data.biggestRoom)
    }).catch(function (error) {
        console.log(error);
    })
}

const updateTriviaRecord = (trivia, key) => {
    console.log('hi')
    axios.patch(url, {
        [key]: {
            trivia,
            numAnswers: trivia.numAnswerers,
            numCorrect: trivia.numCorrectAnswers,
            numWrong: trivia.numWrongAnswers,
            updatedAt: new Date().getTime(),
        }
    }).then(function (response) {
        console.log("Leaderboard Update: " + key)
        console.log(response.data[key])
    }).catch(function (error) {
        console.log(error);
    })
}

module.exports = {
    updateUserRecord,
    updateBiggestRoom,
    updateTriviaRecord
}