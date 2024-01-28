import { ethers } from 'ethers';
import { LEDGER_DOMAIN_HASH } from "./../../data/data";

export function toLedgerTypedDataHash(structHash) {
    // Prepare the data according to the EIP-712 standard
    const data = ethers.utils.solidityPack(
        ['string', 'bytes32', 'bytes32'],
        ["\x19\x01", LEDGER_DOMAIN_HASH, structHash]
    );
  
    // Hash the data
    return ethers.utils.keccak256(data);
}