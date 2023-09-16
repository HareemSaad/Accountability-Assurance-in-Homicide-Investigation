const dotenv = require('dotenv').config()
const { ethers } = require('ethers');
const officerABI = require("./../contracts/out/Officers.sol/Officers.json")

const officerContractAddress = process.env.OFFICER_CONTRACT_ADDRESS;
const privateKey = process.env.WALLET_KEY;
const rpc = process.env.RPC_URL;

const provider = ethers.getDefaultProvider(11155111, {
    alchemy: rpc
});
const signer = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(officerContractAddress, officerABI.abi, signer);

async function fetchOfficerInfo(officer_address) {
    try {
        const result = await contract.officer(officer_address);
        console.log(result);
    } catch (error) {
        console.error('Error calling contract:', error);
    }
}

async function validateOfficer(officer_address) {
    try {
        const result = await contract.isValidOfficer(officer_address);
        console.log(result);
    } catch (error) {
        console.error('Error calling contract:', error);
    }
}

module.exports = {
    fetchOfficerInfo: fetchOfficerInfo,
    validateOfficer: validateOfficer
};