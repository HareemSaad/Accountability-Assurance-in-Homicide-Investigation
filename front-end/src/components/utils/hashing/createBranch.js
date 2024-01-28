import { ethers } from 'ethers';
import { CREATE_BRANCH_REQUEST_TYPEHASH } from "./../../data/data";

export const createBranchHash = (
    _nonce,
    _precinctAddress,
    _jurisdictionArea,
    _stateCode,
    _branchId,
    _expiry
) => {
    const hash = ethers.utils.hexlify(ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'uint', ' string', 'uint', 'uint', 'bytes32', 'uint'],
          [
            CREATE_BRANCH_REQUEST_TYPEHASH,
            _nonce,
            _precinctAddress,
            _jurisdictionArea,
            _stateCode,
            _branchId,
            _expiry
          ])
    ));

    return hash;
};