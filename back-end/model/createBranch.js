const mongoose = require('mongoose')

const CreateBranchSchema = new mongoose.Schema ({
    id: {
        type: Number,
        required: true
    },
    precinctAddress: {
        type: String,
        required: true
    },
    jurisdictionArea: {
        type: Number,
        required: true,
    },
    stateCode: {
        type: Number,
        required: true,
    },
    branchId: {
        type: String,
        required: true,
    },
    nonce: {
        type: Number,
        required: true,
    },
    signature: {
        type: Array
    },
    signers: {
        type: Array
    },
    expiry: {
        type: Number,
        required: true
    },
    isOpen: {
        type: Boolean,
        default: true
    }
})


const CreateBranch = new mongoose.model('CreateBranch', CreateBranchSchema)
module.exports = CreateBranch