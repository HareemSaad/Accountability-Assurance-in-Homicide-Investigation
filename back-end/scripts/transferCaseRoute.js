const express = require('express')
const path = require('path')
const router = express.Router()

const TransferCase = require('../model/transferCase')

// create transfer-case request - page
router.post('/create-request/transfer-case', async (req, res) => {
    // console.log("req.body:: ", req.body)
    try { 
        let lastId;
        await TransferCase.find().sort({ _id: -1 }).limit(1)  
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
        const TransferCaseInfo = new TransferCase(req.body)
        console.log("TransferCaseInfo:: ",TransferCaseInfo)
        
        // saving the data in mongodb database
        TransferCaseInfo.save()

        // Send a 200 status if data is saved successfully
        res.status(200).json({ message: 'Data saved successfully' });
    
    } catch (err) {
        console.error("Error: ", err);
        // Send a 400 status if there is an error
        res.status(400).json({ error: 'Error Occured' });
    }

})

// view all transfer-case requests - page
router.get('/view-transfer-case', async (req, res) => {
    // console.log("req.query:: ", req.query.userStateCode)
    const userStateCode = req.query.userStateCode;

    await TransferCase.find({ stateCode: userStateCode })
    .then(requests => {
        res.send(requests);
    })
    .catch(err => {
        // console.error("Error: ", err);
        res.status(400).json({ error: 'Error Occured' });
    });
})

// view details of a transfer-case request - page
router.get('/view-transfer-case/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await TransferCase.find({'id': idParam})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// sign transfer-case request - push signer address in signers array (if not already exists)
router.post('/view-transfer-case/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await TransferCase.updateOne({'id': `${idParam}`}, {$addToSet: { signers: req.body.userAddress }})
    .then(requests => res.status(200))
    .catch(err => console.log("errorr:: ", err))
})

module.exports = router