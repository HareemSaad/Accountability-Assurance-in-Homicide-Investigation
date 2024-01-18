const mongoose = require('mongoose')

const TransferCaptainSchema = new mongoose.Schema ({
    id: {
        type: Number,
        required: true
    },
    moderator: {
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
    caseId: {
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

const TransferCaptain = new mongoose.model('TransferCaptain', TransferCaptainSchema)
module.exports = TransferCaptain