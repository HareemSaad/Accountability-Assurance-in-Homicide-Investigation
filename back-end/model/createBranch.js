const mongoose = require('mongoose')

const CreateBranchSchema = new mongoose.Schema ({
    id: {
        type: String,
        required: true
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
    nonce: {
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


const CreateBranch = new mongoose.model('CreateBranch', CreateBranchSchema)
module.exports = CreateBranch