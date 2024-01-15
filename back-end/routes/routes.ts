import express from 'express';
import cors from 'cors';
const dotenv = require('dotenv').config()
import { fetchOfficerInfo, validateOfficer } from "../scripts/OfficerInfo";

const createBranchRoute = require("../scripts/createBranchRoute")
const OfficerOnboard = require('../scripts/officerOnboardRoute')
const OfficerOffboard = require('../scripts/officerOffboardRoute')
const TransferOfficerBranch = require('../scripts/transferOfficerBranchRoute')
const TrusteeRequest = require('../scripts/trusteeRequestRoute')
const UpdateBranch = require('../scripts/updateBranchRoute')
const UpdateOfficer = require('../scripts/updateOfficerRoute')
const TransferCaptain = require('../scripts/transferCaptainRoute')
const TransferCase = require('../scripts/transferCaseRoute')

const router = express.Router();
router.use(cors());

router.post("/fetchOfficerInfo", fetchOfficerInfo);
router.get('/validateOfficer', validateOfficer);

router.use(createBranchRoute);
router.use(OfficerOnboard);
router.use(OfficerOffboard);
router.use(TransferOfficerBranch);
router.use(TrusteeRequest);
router.use(UpdateBranch);
router.use(UpdateOfficer);
router.use(TransferCaptain);
router.use(TransferCase);

module.exports = {
  routes: router
}   