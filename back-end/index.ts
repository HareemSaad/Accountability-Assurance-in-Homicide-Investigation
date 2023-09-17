import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser"; //import body parser
import path from 'path';
import { Console } from 'console';
import { validateOfficer } from "./scripts/OfficerInfo";
import dotenv from 'dotenv';
import { ethers } from 'ethers';
const officerABI = require("./contracts/out/Officers.sol/Officers.json");
const caseABI = require("./contracts/out/Cases.sol/Cases.json");
dotenv.config()
let poolRoutes = require('./routes/routes');
const port = 3000;

const app = express();
app.use(express.json())
app.use(cors());
app.use(bodyParser.json());


const officerContractAddress = process.env.OFFICER_CONTRACT_ADDRESS;
const caseContractAddress = process.env.CASE_CONTRACT_ADDRESS;
const privateKey = process.env.WALLET_KEY;
const rpc = process.env.RPC_URL;
const provider = ethers.getDefaultProvider(11155111, {
  alchemy: rpc
});
const signer = new ethers.Wallet(privateKey as string, provider);
const contract = new ethers.Contract(officerContractAddress as string, officerABI.abi, signer);
const casecontract = new ethers.Contract(caseContractAddress as string, caseABI.abi, signer);

const wsprovider = new ethers.WebSocketProvider(process.env.WS_RPC_URL as string)
const wssigner = new ethers.Wallet(privateKey as string, wsprovider);
const wscontract = new ethers.Contract(officerContractAddress as string, officerABI.abi, wssigner);
const wscasecontract = new ethers.Contract(caseContractAddress as string, caseABI.abi, wssigner);

main().catch(err => console.log(err));

async function main() {

  // await validateOfficer('0x86D5cA9d24ecE1d8c35a45b83Ba15B1B9e11BD50');

  try {
    wscontract.on(wscontract.filters.NewOfficer, (officer, newRank, when, from, event) => {
      console.log('NewOfficer event detected:');
      console.log('Officer:', officer);
      console.log('New Rank:', newRank.toString());
      console.log('When:', when.toString());
      console.log('From:', from);
    });

    wscasecontract.on(wscasecontract.filters.NewCase, (caseId, initiator, event) => {
      console.log('NewCase event detected:');
      console.log('Case ID:', caseId.toString());
      console.log('Initiator:', initiator);
    });

    wscasecontract.on(wscasecontract.filters.CaseStatusUpdated, (caseId, initiator, oldStatus, newStatus, event) => {
      console.log('CaseStatusUpdated event detected:');
      console.log('Case ID:', caseId.toString());
      console.log('Initiator:', initiator);
      console.log('Old Status:', oldStatus.toString());
      console.log('New Status:', newStatus.toString());
    });

    wscasecontract.on(wscasecontract.filters.AddOfficer, (caseId, initiator, officer, event) => {
      console.log('AddOfficer event detected:');
      console.log('Case ID:', caseId.toString());
      console.log('Initiator:', initiator);
      console.log('Officer:', officer);
    });

    wscasecontract.on(wscasecontract.filters.NewParticipantInCase, (caseId, initiator, suspectId, category, dataHash, data, event) => {
      console.log('NewParticipantInCase event detected:');
      console.log('Case ID:', caseId.toString());
      console.log('Initiator:', initiator);
      console.log('Suspect ID:', suspectId.toString());
      console.log('Category:', category.toString());
      console.log('Data Hash:', dataHash);
      console.log('Data:', data);
    });

    wscasecontract.on(wscasecontract.filters.NewEvidenceInCase, (caseId, initiator, evidenceId, category, dataHash, data, event) => {
      console.log('NewEvidenceInCase event detected:');
      console.log('Case ID:', caseId.toString());
      console.log('Initiator:', initiator);
      console.log('Evidence ID:', evidenceId.toString());
      console.log('Category:', category.toString());
      console.log('Data Hash:', dataHash);
      console.log('Data:', data);
    });
  } catch (error) {
    console.error('Error subscribing to the NewOfficer event:', error);
  } 

  //onboard(address _officer, string memory name, string memory badge, Rank rank)
  // await contract.onboard(
  //   '0x8233c83CbF40Aa2F6407DdDb9f91C6d126CF31a9',
  //   "Bob",
  //   "DET_100",
  //   1
  // );

  // console.log(await contract.CAPTAIN_ROLE(), signer.address)

  // console.log(await contract.grantRole(await contract.CAPTAIN_ROLE(), signer.address))
  await casecontract.addCase(129);

}

app.use("/", poolRoutes.routes);

app.get('/', (req: any, res: any) => res.send('Hello World!'));
// app.get('/fetchTables', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Express app running on port ${port}!`));