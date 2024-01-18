const express = require('express')
const path = require('path')
const router = express.Router()

const TransferCaptain = require('../model/transferCaptain')

// create transfer-captain request - page
router.post('/create-request/transfer-captain', async (req, res) => {
    // console.log("req.body:: ", req.body)
    try {
        let lastId;
        await TransferCaptain.find().sort({ _id: -1 }).limit(1)  
        .then(requests => {
            if (requests.length === 0) {
                lastId = 0
            } else {
                lastId = requests[0].id
            }
        })
        .catch(err => console.log("errorr:: ", err))
        
        req.body['id'] = lastId + 1;
        req.body['nonce'] = Math.floor(Math.random() * 10000);
        
        // input req.body into schema
        const TransferCaptainInfo = new TransferCaptain(req.body)
        console.log("TransferCaptainInfo:: ",TransferCaptainInfo)
        
        // saving the data in mongodb database
        TransferCaptainInfo.save()

        // Send a 200 status if data is saved successfully
        res.status(200).json({ message: 'Data saved successfully' });
    
    } catch (err) {
        console.error("Error: ", err);
        // Send a 400 status if there is an error
        res.status(400).json({ error: 'Error Occured' });
    }

})

// view all transfer-captain requests - page
router.get('/view-transfer-captain', async (req, res) => {
    // console.log("req.query:: ", req.query.userStateCode)
    const userStateCode = req.query.userStateCode;

    await TransferCaptain.find({ stateCode: userStateCode })
    .then(requests => {
        res.send(requests);
    })
    .catch(err => {
        // console.error("Error: ", err);
        res.status(400).json({ error: 'Error Occured' });
    });
})

// view details of a transfer-captain request - page
router.get('/view-transfer-captain/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await TransferCaptain.find({'id': idParam})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// sign transfer-captain request - push signer address in signers array (if not already exists)
router.post('/view-transfer-captain/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await TransferCaptain.updateOne({'id': `${idParam}`}, {$addToSet: { signers: req.body.userAddress }})
    .then(requests => res.status(200))
    .catch(err => console.log("errorr:: ", err))
})

module.exports = router