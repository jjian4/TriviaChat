const trivias = []

//Contains category, type, difficulty, question, correct_answer, incorrect_answers

const addTrivia = (trivia) => {
    trivia.numAnswerers = 0
    trivias.push(trivia)
}

const removeTrivia = () => {

}



module.exports = {
    addTrivia,
    removeTrivia
}