import { ethers } from 'ethers';
import { TRANSFER_CAPTAIN_REQUEST_TYPEHASH } from "./../../data/data";

export const transferCaptainHash = (
    _moderator,
    _fromCaptain,
    _toCaptain,
    _branchId,
    _nonce,
    _caseId,
    _reciever,
    _expiry,
) => {
    const hash = ethers.utils.hexlify(ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'address', 'address', ' address', 'bytes32', 'uint', 'uint', 'bool', 'uint'], 
          [
            TRANSFER_CAPTAIN_REQUEST_TYPEHASH,
            _moderator,
            _fromCaptain,
            _toCaptain,
            _branchId,
            _nonce,
            _caseId,
            _reciever,
            _expiry
          ])
    ));

    return hash;
};