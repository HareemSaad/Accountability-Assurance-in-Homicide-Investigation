const mongoose = require('mongoose')

const UpdateOfficerSchema = new mongoose.Schema ({
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
    updateType: {
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


const UpdateOfficer = new mongoose.model('UpdateOfficer', UpdateOfficerSchema)
module.exports = UpdateOfficer