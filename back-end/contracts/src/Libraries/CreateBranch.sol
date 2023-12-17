// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

library CreateBranch {

    struct CreateBranchVote {
        uint nonce;
        string precinctAddress;
        uint jurisdictionArea;
        uint stateCode;
        bytes32 branchId;
    }

    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "CreateBranchVote("
        "uint nonce"
        "string precinctAddress,"
        "uint jurisdictionArea,"
        "uint stateCode,"
        "bytes32 branchId,"
        ")"
    );

    function hash(CreateBranchVote calldata request) public pure returns (bytes32) {
        return (
            keccak256(
                abi.encode(
                    REQUEST_TYPE_HASH,
                    request.nonce,
                    request.precinctAddress,
                    request.jurisdictionArea,
                    request.stateCode,
                    request.branchId
                )
            )
        );
    }

}