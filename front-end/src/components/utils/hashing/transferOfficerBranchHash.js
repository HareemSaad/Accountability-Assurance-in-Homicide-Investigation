import { ethers } from 'ethers';
import { TRANSFER_OFFICER_BRANCH_REQUEST_TYPEHASH } from "./../../data/data";

export const transferOfficerBranchHash = (
    _verifiedAddress,
    _nonce,
    _name,
    _legalNumber,
    _badge,
    _branchId,
    _toBranchId,
    _employmentStatus,
    _rank,
    _reciever,
    _expiry,
) => {
    const hash = ethers.utils.hexlify(ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'address', 'uint', ' string', 'bytes32', 'bytes32', 'bytes32', 'bytes32', 'uint', 'uint', 'bool', 'uint'], 
          [
            TRANSFER_OFFICER_BRANCH_REQUEST_TYPEHASH,
            _verifiedAddress,
            _nonce,
            _name,
            _legalNumber,
            _badge,
            _branchId,
            _toBranchId,
            _employmentStatus,
            _rank,
            _reciever,
            _expiry,
          ])
    ));

    return hash;
};