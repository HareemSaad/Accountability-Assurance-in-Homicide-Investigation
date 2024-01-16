const express = require('express')
const path = require('path')
const router = express.Router()

const OfficerOnboard = require('../model/officerOnboard')

// view all officer-onboard requests - page
router.get('/view-officer-requests', async (req, res) => {
    // officer - 1
    await OfficerOnboard.find({ 'rank': 1 })
    .then(requests => {
        res.send(requests)
        console.log("requests: ", requests)
    })
    .catch(err => console.log("errorr:: ", err))
})

// view details of a officer-onboard request - page
router.get('/view-officer-requests/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await OfficerOnboard.find({'id': idParam})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// // sign officer onboard request - push signer address in signers array (if not already exists)
// router.post('/view-officer-onboard/:reqId', async (req, res) => {
//     // console.log("req.params:: ", req.params)
//     let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
//     // console.log("matches:: ", idParam)
//     await OfficerOnboard.updateOne({'id': `${idParam}`}, {$addToSet: { signers: req.body.userAddress }})
//     .then(requests => res.status(200))
//     .catch(err => console.log("errorr:: ", err))
// })

module.exports = router