const Filter = require('bad-words')

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

module.exports = {
    generateMessage
}