// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

library TransferBranch {

    struct TransferBranchRequest {
        address verifiedAddress;
        uint nonce;
        string name;
        bytes32 legalNumber;
        bytes32 badge;
        bytes32 branchId;
        bytes32 toBranchId;
        uint employmentStatus;
        uint rank;
        bool reciever;
    }

    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "TransferBranchRequest("
        "address verifiedAddress,"
        "uint nonce,"
        "string name,"
        "bytes32 legalNumber,"
        "bytes32 badge,"
        "bytes32 branchId,"
        "bytes32 toBranchId,"
        "uint employmentStatus,"
        "uint rank,"
        "bool reciever,"
        ")"
    );

    function hash(TransferBranchRequest calldata request) public pure returns (bytes32) {
        return (
            keccak256(
                abi.encode(
                    REQUEST_TYPE_HASH,
                    request.verifiedAddress,
                    request.nonce,
                    request.name,
                    request.legalNumber,
                    request.badge,
                    request.branchId,
                    request.toBranchId,
                    request.employmentStatus,
                    request.rank,
                    request.reciever
                )
            )
        );
    }
}