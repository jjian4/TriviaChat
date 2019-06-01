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
    biggestRoom: {
        type: Map,
        default: {
            num: 0
        }
    }
}, {
    timestamps: true
})

const Leaderboard = mongoose.model('Leaderboard', lbSchema)


module.exports = Leaderboard