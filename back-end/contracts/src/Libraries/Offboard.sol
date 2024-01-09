// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

library OfficerOffboard {

    struct OffboardVote {
        address verifiedAddress;
        uint nonce;
        string name;
        bytes32 legalNumber;
        bytes32 badge;
        bytes32 branchId;
        uint employmentStatus;
        uint rank;
    }

    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "OffboardVote("
        "address verifiedAddress,"
        "uint nonce,"
        "string name,"
        "bytes32 legalNumber,"
        "bytes32 badge,"
        "bytes32 branchId,"
        "uint employmentStatus,"
        "uint rank,"
        ")"
    );

    function hash(OffboardVote calldata request) public pure returns (bytes32) {
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
                    request.employmentStatus,
                    request.rank
                )
            )
        );
    }

}