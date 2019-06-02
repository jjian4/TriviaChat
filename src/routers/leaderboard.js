const express = require('express')
const Leaderboard = require('../models/leaderboard')
const router = new express.Router()

router.get('/leaderboard', async (req, res) => {
    try {
        const lb = await Leaderboard.findOne()

        if (!lb) {
            //Initialize the leaderboard if it doesn't exist
            const newLb = new Leaderboard()
            newLb.save().then(() => {
                console.log('Leaderboard Initialized')
                console.log(newLb)
            }).then(() => {
                res.send(newLb)
            }).catch((error) => {
                console.log('Error!', error)
            })            
        }
        else {
            res.send(lb)
        }
    } catch(e) {
        res.status(500).send()
    }
})

router.patch('/leaderboard', async (req, res) => {
    //First check if the updates (keys in req) are allowed
    const updates = Object.keys(req.body)
    const allowedUpdates = ['mostTriviasAsked', 'mostTriviasCorrect', 'mostJokesAsked', 'mostMessages', 'biggestRoom', 'hardestTrivia', 'easiestTrivia']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send('Invalid updates.')
    }

    try {
        const lb = await Leaderboard.findOne()
        if (!lb) {
            return res.status(404).send()
        }

        updates.forEach((update) => lb[update] = req.body[update])
        await lb.save()

        res.send(lb)

    } catch(e) {
        res.status(400).send(e)
    }
})



module.exports = router