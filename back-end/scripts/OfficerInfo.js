const dotenv = require('dotenv').config()
const { ethers } = require('ethers');
const officerABI = require("./../contracts/out/Officers.sol/Officers.json")

const officerContractAddress = process.env.OFFICER_CONTRACT_ADDRESS;
const privateKey = process.env.WALLET_KEY;
const rpc = process.env.RPC_URL;

async function fetchOfficerInfo(officer_address) {

    console.log(officerContractAddress, privateKey, rpc)

    const provider = ethers.getDefaultProvider(11155111, {
        alchemy: rpc
    });
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(officerContractAddress, officerABI.abi, signer);

    console.log(contract)

    try {
        const result = await contract.officer(officer_address);
        console.log(result);
    } catch (error) {
        console.error('Error calling contract:', error);
    }

    console.log(officer_address);
}

function validateOfficr(officer_address) {
    console.log(officer_address);
}

module.exports = {
    fetchOfficerInfo: fetchOfficerInfo,
    validateOfficr: validateOfficr
};