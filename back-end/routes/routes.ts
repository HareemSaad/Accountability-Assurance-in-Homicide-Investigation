import express from 'express';
import cors from 'cors';
const dotenv = require('dotenv').config()
import { fetchOfficerInfo, validateOfficer } from "../scripts/OfficerInfo";



const router = express.Router();
router.use(cors());

router.post("/fetchOfficerInfo", fetchOfficerInfo);
router.get('/validateOfficer', validateOfficer);

module.exports = {
  routes: router
}   