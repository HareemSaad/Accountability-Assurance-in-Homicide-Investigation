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
        
        req.body['updateBranchInfo']['id'] = lastId + 1;
        req.body['updateBranchInfo']['signature'] = req.body['signature'];
        
        // input req.body into schema
        const UpdateBranchInfo = new UpdateBranch(req.body['updateBranchInfo'])
        console.log("UpdateBranchInfo:: ",UpdateBranchInfo)
        
        // saving the data in mongodb database
        await UpdateBranchInfo.save()

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
    console.log("req.query:: ", req.query.userStateCode)
    const userStateCode = req.query.userStateCode;

    await UpdateBranch.find({ stateCode: userStateCode })
    .then(requests => {
        res.send(requests);
    })
    .catch(err => {
        console.error("Error: ", err);
        res.status(400).json({ error: 'Error Occured' });
    });
})

// view details of a Update Branch request - page
router.get('/view-update-branch/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    try {
        const request = await UpdateBranch.findOne({ 'id': idParam });
        // console.log("request:: ", request)
    
        if (request) {
            // Convert Unix timestamp to JavaScript Date object
            const expiryDate = new Date(request.expiry * 1000);
            // console.log("expiryDate: ", expiryDate)
            
            // Get the current date
            const currentDate = new Date();
            // console.log("currentDate: ", currentDate)
    
            // Compare the expiry date with the current date
            if (currentDate > expiryDate) {
                // Update the document's isOpen status to closed
                await UpdateBranch.updateOne({ 'id': idParam }, { $set: { isOpen: false } });
    
                // Send the updated document as the response
                res.status(200).json({ message: 'Document updated successfully', document: await UpdateBranch.findOne({ 'id': idParam }) });
            } else {
                // If current date is not greater than expiry date, no need to update isOpen status
                res.status(200).json({ message: 'Document not updated', document: request });
            }
        } else {
            res.status(404).json({ error: 'Document not found' });
        }
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// sign update branch request - push signer address in signers array (if not already exists)
router.post('/view-update-branch/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("idParam:: ", idParam)

    // Check if userAddress already exists in the signers array
    const isAlreadySigned = await UpdateBranch.exists({ 'id': `${idParam}`, 'signers': req.body.userAddress });
    // console.log("isAlreadySigned:: ", isAlreadySigned)

    if (isAlreadySigned) {
        // If the userAddress already exists, send a message to the frontend
        res.status(200).json({ message: 'Already signed' });
    } else {
        // If userAddress doesn't exist, add it to the signers array
        await UpdateBranch.updateOne(
            { 'id': `${idParam}` },
            { 
                $addToSet: { 
                    signers: req.body.userAddress,
                    signature: req.body.signature
                } 
            }
        )
        .then(requests => res.status(200).json({ message: 'Signed successfully' }))
        .catch(err => console.log("errorr:: ", err));
    }
})

router.delete('/delete-update-branch/:reqId', async (req, res) => {
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");

    try {
        const deletedRequest = await UpdateBranch.findOneAndDelete({ 'id': idParam });
        console.log("deletedRequest:: ", deletedRequest)

        if (deletedRequest) {
            res.status(200).json({ message: 'Update Branch request deleted successfully', deletedRequest });
        } else {
            res.status(404).json({ error: 'Update Branch request not found' });
        }
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router