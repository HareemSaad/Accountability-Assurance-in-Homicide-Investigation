const mongoose = require('mongoose')

const UpdateBranchSchema = new mongoose.Schema ({
    id: {
        type: String,
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
        type: Date,
        required: true
    },
    isOpen: {
        type: Boolean,
        default: true
    }
})


const UpdateBranch = new mongoose.model('UpdateBranch', UpdateBranchSchema)
module.exports = UpdateBranch