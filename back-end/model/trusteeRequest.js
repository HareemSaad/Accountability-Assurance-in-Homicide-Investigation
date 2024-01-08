const mongoose = require('mongoose')

const TrusteeRequestSchema = new mongoose.Schema ({
    id: {
        type: String,
        required: true
    },
    caseId: {
        type: String,
        required: true
    },
    trustee: {
        type: String,
        required: true,
    },
    captain: {
        type: String,
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

})


const TrusteeRequest = new mongoose.model('TrusteeRequest', TrusteeRequestSchema)
module.exports = TrusteeRequest