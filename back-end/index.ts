import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser"; //import body parser
import path from 'path';
import { Console } from 'console';
// import cookieParser from "cookie-parser";
// const dotenv = require('dotenv').config()
import dotenv from 'dotenv';
dotenv.config()
let poolRoutes = require('./routes/routes');
const port = 3000;

const app = express();
app.use(express.json())
app.use(cors());


/**
 * to render css
 * this tell where these files are located
 * then index files have rest of the links
 */
// app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json()); // for parsing application/x-www-form-urlencoded
// app.use(cookieParser())

const rhsUrl = process.env.RHS_URL as string;
const rpcUrl = process.env.RPC_URL as string;
const contractAddress = process.env.CONTRACT_ADDRESS as string;
const walletKey = process.env.WALLET_KEY as string;
const circuitsFolder = process.env.CIRCUITS_PATH as string;

main().catch(err => console.log(err));

async function main() {

  console.log(rhsUrl, rpcUrl, contractAddress, walletKey, circuitsFolder);

  // Connect to the database
  // connection.connect((err: any) => {
  //   // if (err) throw err;
  //   if (err) console.log(err);
  //   console.log('Connected to the MySQL server!');
  // });

  // DON'T UNCOMMENT THESE
  // 100s asset - 200s liability - 300 OE - 400 OW - 500s Revenue - 600s Expense
  // table creation
  // tableCreation.createHeadsTable()
  // tableCreation.createGeneralJournalTable()
  // tableCreation.createTAcountTable(300, "Owner Capital")
  // tableCreation.createTAcountTable(400, "Owner Withdrawal")
  //Asset
  // tableCreation.createTAcountTable(100, "Cash")
  // tableCreation.createTAcountTable(101, "Supply")
  // tableCreation.createTAcountTable(102, "Land")
  // //Revenue
  // tableCreation.createTAcountTable(500, "Rental Revenue")
  // //Liability
  // tableCreation.createTAcountTable(200, "Account Payable")
  // //Expense
  // tableCreation.createTAcountTable(600, "Rent Expense")
  // tableCreation.createTAcountTable(800, "Income Summary")
  // tableCreation.createTAcountTable(601, "Utility Expense")
  // tables deletion
  // tableCreation.dropAllTables()
  //-------------------------------------------------------------------------------------------------------------------
  // DON'T UNCOMMENT THESE
  // 100s asset - 200s liability - 300 OE - 400 OW - 500s Revenue - 600s Expense - 700s Contra assets - 800 income summary
  // table creation
  // tableCreation.createHeadsTable()
  // tableCreation.createGeneralJournalTable()
  
  // tableCreation.createTAcountTable(300, "Owner Capital")
  // tableCreation.createTAcountTable(400, "Owner Withdrawal")
  
  // //Asset 100s
  // tableCreation.createTAcountTable(100, "Cash")
  // tableCreation.createTAcountTable(101, "Office Supplies")
  // tableCreation.createTAcountTable(102, "Land")
  // tableCreation.createTAcountTable(103, "Prepaid Insurance")
  // tableCreation.createTAcountTable(104, "Equipment")
  // tableCreation.createTAcountTable(105, "Accounts Receivable")
  
  // //Conta-Asset - 700s
  // tableCreation.createTAcountTable(700, "Acc Dep Insurance")
  // tableCreation.createTAcountTable(701, "Acc Dep Equipment")
  
  // //Liability - 200s
  // tableCreation.createTAcountTable(200, "Account Payable")
  // tableCreation.createTAcountTable(201, "Unearned Revenue")
  // tableCreation.createTAcountTable(202, "Notes Payable")
  
  // //Revenue
  // tableCreation.createTAcountTable(500, "Service Revenue")
  // tableCreation.createTAcountTable(501, "Rental Revenue")
  
  // //Expense
  // tableCreation.createTAcountTable(600, "Supplies Expense")
  // tableCreation.createTAcountTable(601, "Interest Expense")
  // tableCreation.createTAcountTable(602, "Dep Exp Insurance")
  // tableCreation.createTAcountTable(603, "Dep Exp Equipment")
  
  // tableCreation.createTAcountTable(604, "Rent Expense")
  // tableCreation.createTAcountTable(605, "Salaries Expense")
  // tableCreation.createTAcountTable(606, "Advertising Expense")
  // tableCreation.createTAcountTable(607, "Utilities Expense")
  
  // //INCOME SUMMARY - 800
  // tableCreation.createTAcountTable(800, "Income Summary")
  
  // tables deletion
  // tableCreation.dropAllTables()
  //-------------------------------------------------------------------------------------------------------------------
  
  // fetching.fetchTables()
  // insertData.insertData(100, true, false, 100, 'test', 'N');

}

app.use("/", poolRoutes.routes);

app.get('/', (req: any, res: any) => res.send('Hello World!'));
// app.get('/fetchTables', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Express app running on port ${port}!`));