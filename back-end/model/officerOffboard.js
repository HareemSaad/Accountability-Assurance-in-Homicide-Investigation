const mongoose = require('mongoose')

const OfficerOffboardSchema = new mongoose.Schema ({
    id: {
        type: String,
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
        type: Number,
        required: true,
    },
    branchId: {
        type: Number,
        required: true,
    },
    employmentStatus: {
        type: String,
        required: true,
    },
    rank: {
        type: String,
        required: true,
    },
    signature: {
        type: Array
    },
    signers: {
        type: Array
    },

})

const OfficerOffboard = new mongoose.model('OfficerOffboard', OfficerOffboardSchema)
module.exports = OfficerOffboard