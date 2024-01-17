import { ethers } from 'ethers';

export function keccakString(data) {
    // Prepare the data according to the EIP-712 standard
    return ethers.utils.hexlify(ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [data])
      ));
}