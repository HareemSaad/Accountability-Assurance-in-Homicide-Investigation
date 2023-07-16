import express from 'express';
import cors from 'cors';
const dotenv = require('dotenv').config()



const router = express.Router();
router.use(cors());

// router.post("/fetchTables", fetchTables);
// router.post("/insertTxns", insertData);
// router.post("/createAccount", createAccount);
// router.post("/closeAccount", closeAccount);


// router.get("/view-general-journal", (req, res) => {
  
// })

module.exports = {
  routes: router
}   