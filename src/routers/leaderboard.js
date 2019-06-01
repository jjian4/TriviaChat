const express = require('express')
const Leaderboard = require('../models/leaderboard')
const router = new express.Router()

router.get('/leaderboard', async (req, res) => {
    // res.send({
    //     testing: 'testing!!'
    // })

    try {
        const lb = await Leaderboard.findOne()

        if (!lb) {
            //Initialize the leaderboard
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



module.exports = router