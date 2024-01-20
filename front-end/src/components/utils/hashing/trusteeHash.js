import { ethers } from 'ethers';
import { TRUSTEE_REQUEST_TYPEHASH } from "../../data/data";

export const trusteeHash = (
    _caseId,
    _trustee,
    _moderator,
    _captain,
    _branchId,
    _expiry
) => {
    const hash = ethers.utils.hexlify(ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'uint', 'address', 'address', 'address', 'bytes32', 'uint'], 
          [
            TRUSTEE_REQUEST_TYPEHASH,
            _caseId,
            _trustee,
            _moderator,
            _captain,
            _branchId,
            _expiry
          ])
    ));

    return hash;
};