const mongoose = require('mongoose')

const UpdateBranchSchema = new mongoose.Schema ({
    id: {
        type: Number,
        required: true
    },
    nonce: {
        type: Number,
        required: true,
    },
    precinctAddress: {
        type: String,
        required: true
    },
    jurisdictionArea: {
        type: String,
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


const UpdateBranch = new mongoose.model('UpdateBranch', UpdateBranchSchema)
module.exports = UpdateBranch