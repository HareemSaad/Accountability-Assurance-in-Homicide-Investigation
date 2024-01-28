import { ethers } from 'ethers';
import { OFFICER_OFFBOARD_REQUEST_TYPEHASH } from "./../../data/data";

export const officerOffboardHash = (
    _verifiedAddress,
    _nonce,
    _name,
    _legalNumber,
    _badge,
    _branchId,
    _employmentStatus,
    _rank,
    _expiry
) => {
    const hash = ethers.utils.hexlify(ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'address', 'uint', ' string', 'bytes32', 'bytes32', 'bytes32', 'uint', 'uint', 'uint'], 
          [
            OFFICER_OFFBOARD_REQUEST_TYPEHASH,
            _verifiedAddress,
            _nonce,
            _name,
            _legalNumber,
            _badge,
            _branchId,
            _employmentStatus,
            _rank,
            _expiry
          ])
    ));

    return hash;
};