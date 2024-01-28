const mongoose = require('mongoose')

const TransferCaseSchema = new mongoose.Schema ({
    id: {
        type: Number,
        required: true
    },
    fromCaptain: {
        type: String,
        required: true,
    },
    toCaptain: {
        type: String,
        required: true,
    },
    nonce: {
        type: Number,
        required: true,
    },
    caseId: {
        type: Number,
        required: true,
    },
    stateCode: {
        type: Number,
        required: true,
    },
    fromBranchId: {
        type: String,
        required: true,
    },
    toBranchId: {
        type: String,
        required: true,
    },
    receiver: {
        type: Boolean,
    },
    signatureFromCaptain: {
        type: String
    },
    signatureToCaptain: {
        type: String
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


const TransferCase = new mongoose.model('TransferCase', TransferCaseSchema)
module.exports = TransferCase