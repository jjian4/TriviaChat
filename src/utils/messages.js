const Filter = require('bad-words')
var decode = require('unescape');
const axios = require('axios')

const shuffle = require('shuffle-array')
const { addTrivia } = require('./trivias')

const generateMessage = (username, text) => {
    const filter = new Filter({ placeHolder: 'x'})

    //Remove profanity
    text = filter.clean(text)

    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateJokeMessage = async (username) => {
    // const response = await fetch('https://official-joke-api.appspot.com/random_joke')
    // const joke = await response.json();
    
    const response = await axios.get('https://official-joke-api.appspot.com/random_joke')
    const joke = response.data

    console.log(joke)

    return {
        username,
        joke,
        createdAt: new Date().getTime()    
    }
}

const generateTriviaMessage = async (user, url) => {
    const response = await axios.get(url)
    const json = response.data

    let trivia = unescapeQuestion(json['results'][0])

    console.log(trivia)
    addTrivia(trivia, user.room)

    let answers = []
    trivia.incorrect_answers.forEach(ans => {
        answers.push(ans)
    });
    answers.push(trivia.correct_answer)
    shuffle(answers)

    return {
        username: user.username,
        trivia,
        answers,
        createdAt: new Date().getTime()    
    }
}


const unescapeQuestion = (question) => {
    question.category = question.category.trim()
    question.category = decode(question.category, 'all')

    question.question = question.question.trim()
    question.question = question.question.replace(/&#039;/g, '&#39;')
    question.question = decode(question.question, 'all')

    question.correct_answer = question.correct_answer.trim()
    question.correct_answer = question.correct_answer.replace(/&#039;/g, '&#39;')
    question.correct_answer = decode(question.correct_answer, 'all')

    question.incorrect_answers.forEach(function (str, index) {
        let str2 = str.trim()
        str2 = str2.replace(/&#039;/g, '&#39;')
        question.incorrect_answers[index] = decode(str2, 'all')
    });

    return question
}

module.exports = {
    generateMessage,
    generateJokeMessage,
    generateTriviaMessage,
    unescapeQuestion
}