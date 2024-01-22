const express = require('express')
const path = require('path')
const router = express.Router()

const OfficerOnboard = require('../model/officerOnboard')

// create officer-onboard request - page
router.post('/create-request/officer-onboard', async (req, res) => {
    // console.log("req.body:: ", req.body['officerOnboardInfo'])
    
    try {
        let lastId;
        await OfficerOnboard.find().sort({ _id: -1 }).limit(1)  
        .then(requests => {
            if (requests.length === 0) {
                lastId = 0
            } else {
                lastId = requests[0].id
            }
        })
        .catch(err => console.log("errorr:: ", err))
        
        req.body['officerOnboardInfo']['id'] = lastId + 1;
        // req.body['officerOnboardInfo']['nonce'] = Math.floor(Math.random() * 10000);
        req.body['officerOnboardInfo']['signature'] = req.body['signatureOfficerOnboard']
        
        console.log("req.body2:: ", req.body['officerOnboardInfo'])
        
        // input req.body into schema
        const OfficerOnboardInfo = new OfficerOnboard(req.body['officerOnboardInfo'])
        console.log("OfficerOnboardInfo:: ",OfficerOnboardInfo)
        
        // saving the data in mongodb database
        await OfficerOnboardInfo.save()

        // Send a 200 status if data is saved successfully
        res.status(200).json({ message: 'Data saved successfully' });
    
    } catch (err) {
        console.error("Error: ", err);
        // Send a 400 status if there is an error
        res.status(400).json({ error: 'Error Occured' });
    }

})

// view all officer-onboard requests - page
router.get('/view-officer-onboard', async (req, res) => {
    console.log("req.query:: ", req.query.userStateCode)
    const userStateCode = req.query.userStateCode;

    await OfficerOnboard.find({ stateCode: userStateCode })
    .then(requests => {
        res.send(requests);
    })
    .catch(err => {
        // console.error("Error: ", err);
        res.status(400).json({ error: 'Error Occured' });
    });
})

// view details of a officer-onboard request - page
router.get('/view-officer-onboard/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await OfficerOnboard.find({'id': idParam})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// sign officer onboard request - push signer address in signers array (if not already exists)
router.post('/view-officer-onboard/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await OfficerOnboard.updateOne({'id': `${idParam}`}, {$addToSet: { signers: req.body.userAddress }})
    .then(requests => res.status(200))
    .catch(err => console.log("errorr:: ", err))
})

router.delete('/delete-officer-onboard/:reqId', async (req, res) => {
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");

    try {
        const deletedRequest = await OfficerOnboard.findOneAndDelete({ 'id': idParam });
        console.log("deletedRequest:: ", deletedRequest)

        if (deletedRequest) {
            res.status(200).json({ message: 'Officer Onboard request deleted successfully', deletedRequest });
        } else {
            res.status(404).json({ error: 'Officer Onboard request not found' });
        }
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router