const mongoose = require('mongoose')

const TrusteeRequestSchema = new mongoose.Schema ({
    id: {
        type: Number,
        required: true
    },
    caseId: {
        type: Number,
        required: true
    },
    trustee: {
        type: String,
        required: true,
    },
    moderator: {
        type: String, 
        required: true
    },
    captain: {
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


const TrusteeRequest = new mongoose.model('TrusteeRequest', TrusteeRequestSchema)
module.exports = TrusteeRequest