import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser"; //import body parser
import path from 'path';
import { Console } from 'console';
import { fetchOfficerInfo } from "./scripts/OfficerInfo";
import dotenv from 'dotenv';
dotenv.config()
let poolRoutes = require('./routes/routes');
const port = 3000;

const app = express();
app.use(express.json())
app.use(cors());
app.use(bodyParser.json());

const rhsUrl = process.env.RHS_URL as string;
const rpcUrl = process.env.RPC_URL as string;
const contractAddress = process.env.CONTRACT_ADDRESS as string;
const walletKey = process.env.WALLET_KEY as string;
const circuitsFolder = process.env.CIRCUITS_PATH as string;

main().catch(err => console.log(err));

async function main() {

  fetchOfficerInfo('0x86D5cA9d24ecE1d8c35a45b83Ba15B1B9e11BD50');

}

app.use("/", poolRoutes.routes);

app.get('/', (req: any, res: any) => res.send('Hello World!'));
// app.get('/fetchTables', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Express app running on port ${port}!`));