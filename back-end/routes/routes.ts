import express from 'express';
import cors from 'cors';
const dotenv = require('dotenv').config()
import { fetchOfficerInfo, validateOfficr } from "../scripts/OfficerInfo";



const router = express.Router();
router.use(cors());

router.post("/fetchOfficerInfo", fetchOfficerInfo);
router.get('/validateOfficer', validateOfficr);

module.exports = {
  routes: router
}   