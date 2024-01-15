const express = require('express')
const path = require('path')
const router = express.Router()

const TrusteeRequest = require('../model/trusteeRequest')

// create Trustee Request - page
router.post('/create-request/trustee-request', async (req, res) => {
    // console.log("req.body:: ", req.body)
    try {
        let lastId;
        await TrusteeRequest.find().sort({id:-1}).limit(1)  
        .then(requests => {
            if (requests.length === 0) {
                lastId = 0
            } else {
                lastId = requests[0].id
            }
        })
        .catch(err => console.log("errorr:: ", err))
        // check if case id exists
        
        req.body['id'] = parseInt(lastId) + 1;
        // req.body['nonce'] = Math.floor(Math.random() * 10000);
        
        // input req.body into schema
        const TrusteeRequestInfo = new TrusteeRequest(req.body)
        console.log("TrusteeRequestInfo:: ",TrusteeRequestInfo)
        
        // saving the data in mongodb database
        TrusteeRequestInfo.save()

        // Send a 200 status if data is saved successfully
        res.status(200).json({ message: 'Data saved successfully' });
    
    } catch (err) {
        console.error("Error: ", err);
        // Send a 400 status if there is an error
        res.status(400).json({ error: 'Error Occured' });
    }

})

// view all Trustee Request requests - page
router.get('/view-trustee-request', async (req, res) => {
    await TrusteeRequest.find({})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// view details of a Trustee request - page
router.get('/view-trustee-request/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await TrusteeRequest.find({'id': idParam})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// sign trustee request - push signer address in signers array (if not already exists)
router.post('/view-trustee-request/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await TrusteeRequest.updateOne({'id': `${idParam}`}, {$addToSet: { signers: req.body.userAddress }})
    .then(requests => res.status(200))
    .catch(err => console.log("errorr:: ", err))
})

module.exports = router