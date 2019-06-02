const mongoose = require('mongoose')

const lbSchema = new mongoose.Schema({
    mostTriviasAsked: {
        type: Map,
        default: {
            num: 0
        }
    },
    mostTriviasCorrect: {
        type: Map,
        default: {
            num: 0
        }
    },
    mostJokesAsked: {
        type: Map,
        default: {
            num: 0
        }
    },
    mostMessages: {
        type: Map,
        default: {
            num: 0
        }
    },
    hardestTrivia: {
        type: Map,
        default: {
            numAnswers: 0,
            numCorrect: 0,
            numWrong: 0
        }
    },
    easiestTrivia: {
        type: Map,
        default: {
            numAnswers: 0,
            numCorrect: 0,
            numWrong: 0
        }
    },
    biggestRoom: {
        type: Map,
        default: {
            num: 0
        }
    }
}, {
    timestamps: true
})


//Don't send back _id and __v properties in res
lbSchema.methods.toJSON = function() {
    const lb = this._doc

    delete lb._id
    delete lb.__v

    return lb
}


const Leaderboard = mongoose.model('Leaderboard', lbSchema)


module.exports = Leaderboard