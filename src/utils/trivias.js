const fetch = require('node-fetch')
const { getUsersInRoom } = require('./users')

//Each contains category, type, difficulty, question, correct_answer, incorrect_answers
let trivias = []

const addTrivia = (trivia, room) => {
    trivia.numAnswerers = 0
    trivia.room = room
    trivias.push(trivia)
}

const getTrivia = (question, room) => {
    let trivia = trivias.find((trivia) => trivia.question === question && trivia.room === room)
    trivia.numAnswerers += 1
    
    //Remove trivia when all have answered
    if (trivia.numAnswerers === getUsersInRoom(room).length) {
        trivias = trivias.filter((item) => item !== trivia)
    }

    return trivia
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
    getTrivia,
    getCategories,
    getCategoryId
}