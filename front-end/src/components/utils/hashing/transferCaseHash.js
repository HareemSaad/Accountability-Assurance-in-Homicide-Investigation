import { ethers } from 'ethers';
import { TRANSFER_CASE_REQUEST_TYPEHASH } from "./../../data/data";

export const transferCaseHash = (
    _fromCaptain,
    _toCaptain,
    _nonce,
    _caseId,
    _fromBranchId,
    _toBranchId,
    _reciever,
    _expiry,
    // address fromCaptain;
    // address toCaptain;
    // uint nonce;
    // uint caseId;
    // bytes32 fromBranchId;
    // bytes32 toBranchId;
    // bool reciever;
    // uint expiry;
) => {
    const hash = ethers.utils.hexlify(ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'address', 'address', ' uint', 'uint', 'bytes32', 'bytes32', 'bool', 'uint'], 
          [
            TRANSFER_CASE_REQUEST_TYPEHASH,
            _fromCaptain,
            _toCaptain,
            _nonce,
            _caseId,
            _fromBranchId,
            _toBranchId,
            _reciever,
            _expiry,
          ])
    ));

    return hash;
};