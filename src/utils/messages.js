const Filter = require('bad-words')
var decode = require('unescape');

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
    unescapeQuestion
}