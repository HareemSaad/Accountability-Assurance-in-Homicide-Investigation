import { ethers } from 'ethers';
import { UPDATE_BRANCH_REQUEST_TYPEHASH } from "./../../data/data";

export const updateBranchHash = (
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
            UPDATE_BRANCH_REQUEST_TYPEHASH,
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