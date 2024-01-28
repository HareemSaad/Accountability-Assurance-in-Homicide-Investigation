const mongoose = require('mongoose')

const OfficerOffboardSchema = new mongoose.Schema ({
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
        type: String,
        required: true,
    },
    badge: {
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
    employmentStatus: {
        type: Number,
        required: true,
    },
    rank: {
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

const OfficerOffboard = new mongoose.model('OfficerOffboard', OfficerOffboardSchema)
module.exports = OfficerOffboard