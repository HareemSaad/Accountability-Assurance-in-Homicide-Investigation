const express = require('express')
const path = require('path')
const router = express.Router()

const UpdateOfficer = require('../model/updateOfficer')

// create Update Officer Request - page
router.post('/create-request/update-officer', async (req, res) => {
    // console.log("req.body:: ", req.body)
    try {
        let lastId;
        await UpdateOfficer.find().sort({id:-1}).limit(1)  
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
        const UpdateOfficerInfo = new UpdateOfficer(req.body)
        console.log("UpdateOfficerInfo:: ",UpdateOfficerInfo)
        
        // saving the data in mongodb database
        UpdateOfficerInfo.save()

        // Send a 200 status if data is saved successfully
        res.status(200).json({ message: 'Data saved successfully' });
    
    } catch (err) {
        console.error("Error: ", err);
        // Send a 400 status if there is an error
        res.status(400).json({ error: 'Error Occured' });
    }
})

// view all Update Officer requests - page
router.get('/view-update-officer', async (req, res) => {
    await UpdateOfficer.find({})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// view details of a Update Officer request - page
router.get('/view-update-officer/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await UpdateOfficer.find({'id': idParam})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// sign update officer request - push signer address in signers array (if not already exists)
router.post('/view-update-officer/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await UpdateOfficer.updateOne({'id': `${idParam}`}, {$addToSet: { signers: req.body.userAddress }})
    .then(requests => res.status(200))
    .catch(err => console.log("errorr:: ", err))
})

module.exports = router