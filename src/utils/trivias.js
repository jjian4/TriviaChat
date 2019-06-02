const fetch = require('node-fetch')
const axios = require('axios')
const { getUsersInRoom } = require('./users')
const { updateTriviaRecord } = require('./lb_updates')


//Get initial leaderboard stats
let hardestTrivia = 0
let easiestTrivia = 0
axios.get('http://127.0.0.1:3000/leaderboard').then(function (response) {
    hardestTrivia = response.data.hardestTrivia.numWrong
    easiestTrivia = response.data.easiestTrivia.numCorrect
}).catch(function (error) {
    console.log(error)
})


//Each contains category, type, difficulty, question, correct_answer, incorrect_answers
let trivias = []

const addTrivia = (trivia, room) => {
    trivia.numAnswerers = 0
    trivia.numCorrectAnswers = 0
    trivia.numWrongAnswers = 0
    trivia.room = room
    trivias.push(trivia)
}

//Return {trivia, false} for wrong answer, {trivia, true} for correct answer
const checkTrivia = (question, room, answer) => {
    let trivia = trivias.find((trivia) => trivia.question === question && trivia.room === room)
    trivia.numAnswerers += 1

    //Remove trivia when all have answered
    if (trivia.numAnswerers === getUsersInRoom(room).length) {
        trivias = trivias.filter((item) => item !== trivia)
    }

    if (trivia.correct_answer === answer) {
        trivia.numCorrectAnswers += 1
        if (trivia.numCorrectAnswers > easiestTrivia) {
            easiestTrivia = trivia.numCorrectAnswers
            updateTriviaRecord(trivia, 'easiestTrivia')
        }
        return {
            trivia,
            isCorrect: true
        }
    } else {
        trivia.numWrongAnswers += 1
        if (trivia.numWrongAnswers > hardestTrivia) {
            hardestTrivia = trivia.numWrongAnswers
            updateTriviaRecord(trivia, 'hardestTrivia')
        }
        return {
            trivia,
            isCorrect: false
        }
    }
}



let categories = []
const getCategories = async () => {
    const response = await fetch('https://opentdb.com/api_category.php')
    const data = await response.json();
    categories = data.trivia_categories
    return categories
}

const getCategoryId = (name) => {
    const category = categories.find((category) => category.name === name)
    return category.id
}


module.exports = {
    addTrivia,
    checkTrivia,
    getCategories,
    getCategoryId
}