import express from 'express';
import cors from 'cors';
const dotenv = require('dotenv').config()

// moderator page requests - create and view
const createBranchRoute = require("../scripts/createBranchRoute")
const OfficerOnboard = require('../scripts/officerOnboardRoute')
const OfficerOffboard = require('../scripts/officerOffboardRoute')
const TransferOfficerBranch = require('../scripts/transferOfficerBranchRoute')
const TrusteeRequest = require('../scripts/trusteeRequestRoute')
const UpdateBranch = require('../scripts/updateBranchRoute')
const UpdateOfficer = require('../scripts/updateOfficerRoute')
const TransferCaptain = require('../scripts/transferCaptainRoute')
const TransferCase = require('../scripts/transferCaseRoute')

// captain request - view only
const ViewOfficerRequests = require('../scripts/viewOfficerRequests')
const ViewDetectiveRequests = require('../scripts/viewDetectiveRequests')
const CaptainViewTranferRequestRoute = require('../scripts/CaptainViewTranferRequestRoute')


const router = express.Router();
router.use(cors());

// moderator page requests - create and view
router.use(createBranchRoute);
router.use(OfficerOnboard);
router.use(OfficerOffboard);
router.use(TransferOfficerBranch);
router.use(TrusteeRequest);
router.use(UpdateBranch);
router.use(UpdateOfficer);
router.use(TransferCaptain);
router.use(TransferCase);

// captain request - view only
router.use(ViewOfficerRequests)
router.use(ViewDetectiveRequests)
router.use(CaptainViewTranferRequestRoute)

module.exports = {
  routes: router
}   