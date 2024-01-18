const express = require('express')
const path = require('path')
const router = express.Router()

const CreateBranch = require('../model/createBranch')

// create branch - page
router.post('/create-request/create-branch', async (req, res) => {
    try {
        // Get the last ID
        let lastId;
        const requests = await CreateBranch.find().sort({ _id: -1 }).limit(1);

        if (requests.length === 0) {
            lastId = 0;
        } else {
            lastId = requests[0].id;
            console.log("lastId: ", lastId)
        }
        
        // Set id and nonce in req.body
        req.body['id'] = lastId + 1;
        req.body['nonce'] = Math.floor(Math.random() * 10000);

        // Create a new instance of CreateBranch schema
        const createBranchInfo = new CreateBranch(req.body);
        console.log("createBranchInfo:: ", createBranchInfo)

        // Save the data in the MongoDB database
        await createBranchInfo.save();

        // Send a 200 status if data is saved successfully
        res.status(200).json({ message: 'Data saved successfully' });
    } catch (err) {
        console.error("Error: ", err);
        // Send a 400 status if there is an error
        res.status(400).json({ error: 'Error Occured' });
    }
});


// view all create branch requests - page
router.get('/view-create-branch', async (req, res) => {
    // console.log("req.query:: ", req.query.userStateCode)
    const userStateCode = req.query.userStateCode;

    await CreateBranch.find({ stateCode: userStateCode })
    .then(requests => {
        res.send(requests);
    })
    .catch(err => {
        // console.error("Error: ", err);
        res.status(400).json({ error: 'Error Occured' });
    });

})

// view details of a create branch request - page
router.get('/view-create-branch/:reqId', async (req, res) => {
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)

    try {
        const request = await CreateBranch.findOne({ 'id': idParam });
        // console.log("request:: ", request)
    
        if (request) {
            // Convert Unix timestamp to JavaScript Date object
            const expiryDate = new Date(request.expiry * 1000);
            // console.log("expiryDate: ", expiryDate)
    
            // Get the current date
            const currentDate = new Date();
    
            // Compare the expiry date with the current date
            if (currentDate > expiryDate) {
                // Update the document's isOpen status to closed
                await CreateBranch.updateOne({ 'id': idParam }, { $set: { isOpen: false } });
    
                // Send the updated document as the response
                res.status(200).json({ message: 'Document updated successfully', document: await CreateBranch.findOne({ 'id': idParam }) });
            } else {
                // If expiry date is not greater than current date, no need to update isOpen status
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

// sign create branch request - push signer address in signers array (if not already exists)
router.post('/view-create-branch/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.body)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", `${idParam}`)

    // Check if userAddress already exists in the signers array
    const isAlreadySigned = await CreateBranch.exists({ 'id': `${idParam}`, 'signers': req.body.userAddress });
    // console.log("isAlreadySigned:: ", isAlreadySigned)

    if (isAlreadySigned) {
        // If the userAddress already exists, send a message to the frontend
        res.status(200).json({ message: 'Already signed' });
    } else {
        // If userAddress doesn't exist, add it to the signers array
        await CreateBranch.updateOne(
            { 'id': `${idParam}` },
            { $addToSet: { signers: req.body.userAddress } }
        )
        .then(requests => res.status(200).json({ message: 'Signed successfully' }))
        .catch(err => console.log("errorr:: ", err));
}
})


module.exports = router