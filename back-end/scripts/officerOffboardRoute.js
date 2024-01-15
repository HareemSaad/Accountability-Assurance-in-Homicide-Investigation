const express = require('express')
const path = require('path')
const router = express.Router()

const OfficerOffboard = require('../model/officerOffboard')

// create officer-offboard request - page
router.post('/create-request/officer-offboard', async (req, res) => {
    // console.log("req.body:: ", req.body)
    try {
        let lastId;
        await OfficerOffboard.find().sort({id:-1}).limit(1)  
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
        const OfficerOffboardInfo = new OfficerOffboard(req.body)
        console.log("OfficerOffboardInfo:: ",OfficerOffboardInfo)
        
        // saving the data in mongodb database
        OfficerOffboardInfo.save()

        // Send a 200 status if data is saved successfully
        res.status(200).json({ message: 'Data saved successfully' });
    
    } catch (err) {
        console.error("Error: ", err);
        // Send a 400 status if there is an error
        res.status(400).json({ error: 'Error Occured' });
    }

})

// view all officer-offboard requests - page
router.get('/view-officer-offboard', async (req, res) => {
    await OfficerOffboard.find({})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// view details of a officer-offboard request - page
router.get('/view-officer-offboard/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await OfficerOffboard.find({'id': idParam})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// sign officer offboard request - push signer address in signers array (if not already exists)
router.post('/view-officer-offboard/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await OfficerOffboard.updateOne({'id': `${idParam}`}, {$addToSet: { signers: req.body.userAddress }})
    .then(requests => res.status(200))
    .catch(err => console.log("errorr:: ", err))
})

module.exports = router