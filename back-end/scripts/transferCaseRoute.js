const express = require('express')
const path = require('path')
const router = express.Router()

const TransferCase = require('../model/transferCase')

// create transfer-case request - page
router.post('/create-request/transfer-case', async (req, res) => {
    // console.log("req.body:: ", req.body)
    let lastId;
    await TransferCase.find().sort({id:-1}).limit(1)  
    .then(requests => {
        if (requests.length === 0) {
            lastId = 0
        } else {
            lastId = requests[0].id
        }
    })
    .catch(err => console.log("errorr:: ", err))
    
    req.body['id'] = parseInt(lastId) + 1;
    req.body['nonce'] = Math.floor(Math.random() * 10000);
    
    // input req.body into schema
    const TransferCaseInfo = new TransferCase(req.body)
    console.log("TransferCaseInfo:: ",TransferCaseInfo)
    
    // saving the data in mongodb database
    TransferCaseInfo.save()

})

// view all transfer-case requests - page
router.get('/view-transfer-case', async (req, res) => {
    await TransferCase.find({})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
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