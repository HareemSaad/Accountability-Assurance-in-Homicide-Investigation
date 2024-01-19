const express = require('express')
const path = require('path')
const router = express.Router()

const TransferCaptain = require('../model/transferCaptain')
const TransferCase = require('../model/transferCase')

// view all captain-transfer-captain requests - page
router.get('/captain/view-transfer-captain', async (req, res) => {
    // console.log("req.query:: ", req.query.userStateCode)
    const userStateCode = req.query.userStateCode;
    const userAddress = req.query.address;
    
    await TransferCaptain.find({ stateCode: userStateCode, $or: [
        { toCaptain: userAddress },
        { fromCaptain: userAddress }
    ]})
    .then(requests => {
        res.send(requests);
    })
    .catch(err => {
        // console.error("Error: ", err);
        res.status(400).json({ error: 'Error Occured' });
    });
    
})

// view all captain-transfer-case requests - page
router.get('/captain/view-transfer-case', async (req, res) => {
    // console.log("req.query:: ", req.query.userStateCode)
    const userStateCode = req.query.userStateCode;
    const userAddress = req.query.address;

    await TransferCase.find({ stateCode: userStateCode, $or: [
        { toCaptain: userAddress },
        { fromCaptain: userAddress }
    ]})
    .then(requests => {
        res.send(requests);
    })
    .catch(err => {
        // console.error("Error: ", err);
        res.status(400).json({ error: 'Error Occured' });
    });
})

module.exports = router