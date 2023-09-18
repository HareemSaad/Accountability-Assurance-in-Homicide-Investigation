import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser"; //import body parser
import path from 'path';
import mongoose from "mongoose";
import { Console } from 'console';
import { validateOfficer } from "./scripts/OfficerInfo";
import { insert } from "./scripts/newCase"
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
const provider = ethers.getDefaultProvider(rpc as string);
const signer = new ethers.Wallet(privateKey as string, provider);
const contract = new ethers.Contract(officerContractAddress as string, officerABI.abi, signer);
const casecontract = new ethers.Contract(caseContractAddress as string, caseABI.abi, signer);

const wsprovider = new ethers.WebSocketProvider(process.env.WS_RPC_URL as string)
const wssigner = new ethers.Wallet(privateKey as string, wsprovider);
const wscontract = new ethers.Contract(officerContractAddress as string, officerABI.abi, wssigner);
const wscasecontract = new ethers.Contract(caseContractAddress as string, caseABI.abi, wssigner);

main().catch(err => console.log(err));

async function main() {

  const x = await mongoose.connect('mongodb+srv://hareemsaad:rJFaQFBXzXNFiVRF@cluster0.mhwju6z.mongodb.net/');
  // await validateOfficer('0x86D5cA9d24ecE1d8c35a45b83Ba15B1B9e11BD50');

  try {
    wscontract.on(wscontract.filters.NewOfficer, async (officer, newRank, when, from, event) => {
      const eventData = {
        officer: officer,
        newRank: newRank.toString(),
        when: when.toString(),
        from: from
      };
      console.log('NewOfficer event detected:');
      console.log(eventData);
      
    });

    wscasecontract.on(wscasecontract.filters.NewCase, async (caseId, initiator, event) => {
      const eventData = {
        caseId: caseId.toString(),
        initiator: initiator
      };
      console.log('NewCase event detected:');
      console.log(eventData);

      await insert(eventData);
    });

    wscasecontract.on(wscasecontract.filters.CaseStatusUpdated, (caseId, initiator, oldStatus, newStatus, event) => {
      const eventData = {
        caseId: caseId.toString(),
        initiator: initiator,
        oldStatus: oldStatus.toString(),
        newStatus: newStatus.toString()
      };
      console.log('CaseStatusUpdated event detected:');
      console.log(eventData);
    });

    wscasecontract.on(wscasecontract.filters.AddOfficer, (caseId, initiator, officer, event) => {
      const eventData = {
        caseId: caseId.toString(),
        initiator: initiator,
        officer: officer,
        event: event
      };
      console.log('AddOfficer event detected:');
      console.log(eventData);
    });

    wscasecontract.on(wscasecontract.filters.NewParticipantInCase, (caseId, initiator, suspectId, category, dataHash, data, event) => {
      const eventData = {
        caseId: caseId.toString(),
        initiator: initiator,
        suspectId: suspectId.toString(),
        category: category.toString(),
        dataHash: dataHash,
        data: data,
        event: event
      };
      console.log('NewParticipantInCase event detected:');
      console.log(eventData);
    });

    wscasecontract.on(wscasecontract.filters.NewEvidenceInCase, (caseId, initiator, evidenceId, category, dataHash, data, event) => {
      const eventData = {
        caseId: caseId.toString(),
        initiator: initiator,
        evidenceId: evidenceId.toString(),
        category: category.toString(),
        dataHash: dataHash,
        data: data,
        event: event
      };
      console.log('NewEvidenceInCase event detected:');
      console.log(eventData);
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
  // console.log(casecontract)
  
  // try {
  //   await casecontract.addCase('142');
  // } catch (err) {
  //   console.error("Error adding case:", err);
  // }

}

app.use("/", poolRoutes.routes);

app.get('/', (req: any, res: any) => res.send('Hello World!'));
// app.get('/fetchTables', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Express app running on port ${port}!`));