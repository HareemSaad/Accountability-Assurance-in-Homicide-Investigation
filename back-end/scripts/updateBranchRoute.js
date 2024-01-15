const express = require('express')
const path = require('path')
const router = express.Router()

const UpdateBranch = require('../model/updateBranch')

// create Update Branch Request - page
router.post('/create-request/update-branch', async (req, res) => {
    // console.log("req.body:: ", req.body)
    try {
        let lastId;
        await UpdateBranch.find().sort({ _id: -1 }).limit(1)  
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
        const UpdateBranchInfo = new UpdateBranch(req.body)
        console.log("UpdateBranchInfo:: ",UpdateBranchInfo)
        
        // saving the data in mongodb database
        UpdateBranchInfo.save()

        // Send a 200 status if data is saved successfully
        res.status(200).json({ message: 'Data saved successfully' });
    
    } catch (err) {
        console.error("Error: ", err);
        // Send a 400 status if there is an error
        res.status(400).json({ error: 'Error Occured' });
    }

})

// view all Update Branch requests - page
router.get('/view-update-branch', async (req, res) => {
    await UpdateBranch.find({})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// view details of a Update Branch request - page
router.get('/view-update-branch/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await UpdateBranch.find({'id': idParam})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// sign update branch request - push signer address in signers array (if not already exists)
router.post('/view-update-branch/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await UpdateBranch.updateOne({'id': `${idParam}`}, {$addToSet: { signers: req.body.userAddress }})
    .then(requests => res.status(200))
    .catch(err => console.log("errorr:: ", err))
})

module.exports = router