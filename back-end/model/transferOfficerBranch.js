const mongoose = require('mongoose')

const TransferOfficerBranchSchema = new mongoose.Schema ({
    id: {
        type: Number,
        required: true
    },
    verifiedAddress: {
        type: String,
        required: true
    },
    nonce: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    legalNumber: {
        type: Number,
        required: true,
    },
    badge: {
        type: String,
        required: true,
    },
    fromCaptain: {
        type: String,
        required: true,
    },
    toCaptain: {
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
    toBranchId: {
        type: String,
        required: true,
    },
    employmentStatus: {
        type: Number,
        required: true,
    },
    rank: {
        type: Number,
        required: true,
    },
    receiver: {
        type: Boolean,
        default: false
    },
    signatureFromCaptain: {
        type: String,
        default: ""
    },
    signatureToCaptain: {
        type: String,
        default: ""
    },
    signers: {
        type: Array,
        default: []
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

const TransferOfficerBranch = new mongoose.model('TransferOfficerBranch', TransferOfficerBranchSchema)
module.exports = TransferOfficerBranch