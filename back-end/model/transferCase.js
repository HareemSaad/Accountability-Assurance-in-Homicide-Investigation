const mongoose = require('mongoose')

const TransferCaseSchema = new mongoose.Schema ({
    id: {
        type: String,
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
    fromBranchId: {
        type: Number,
        required: true,
    },
    toBranchId: {
        type: Number,
        required: true,
    },
    receiver: {
        type: Boolean,
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


const TransferCase = new mongoose.model('TransferCase', TransferCaseSchema)
module.exports = TransferCase