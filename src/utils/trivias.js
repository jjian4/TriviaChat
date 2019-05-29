const trivias = []

//Contains category, type, difficulty, question, correct_answer, incorrect_answers

const addTrivia = (trivia, room) => {
    trivia.numAnswerers = 0
    trivia.room = room
    trivias.push(trivia)
}

const getTrivia = (question, room) => {
    let trivia = trivias.find((trivia) => trivia.question === question && trivia.room === room)
    trivia.numAnswerers += 1
    return trivia
}


//TODO: remove trivia when all have answered

const removeTrivia = () => {

}



module.exports = {
    addTrivia,
    getTrivia,
    removeTrivia
}