const express = require('express')
const path = require('path')
const router = express.Router()

const CreateBranch = require('../model/createBranch')

// create branch - page
router.post('/create-request/create-branch', async (req, res) => {
    // console.log("req.body:: ", req.body)
    let lastId;
    await CreateBranch.find().sort({id:-1}).limit(1)  
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
    const CreateBranchInfo = new CreateBranch(req.body)
    console.log("CreateBranchInfo:: ",CreateBranchInfo)
    
    // saving the data in mongodb database
    CreateBranchInfo.save()

})

// view all create branch requests - page
router.get('/view-create-branch', async (req, res) => {
    await CreateBranch.find({})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// view details of a create branch request - page
router.get('/view-create-branch/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.params)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", idParam)
    await CreateBranch.find({'id': idParam})
    .then(requests => res.send(requests))
    .catch(err => console.log("errorr:: ", err))
})

// sign create branch request - push signer address in signers array (if not already exists)
router.post('/view-create-branch/:reqId', async (req, res) => {
    // console.log("req.params:: ", req.body)
    let idParam = req.params['reqId'].replace(/[^0-9]/g, "");
    // console.log("matches:: ", `${idParam}`)
    await CreateBranch.updateOne({'id': `${idParam}`}, {$addToSet: { signers: req.body.userAddress }})
    .then(requests => res.status(200))
    .catch(err => console.log("errorr:: ", err))
})


module.exports = router