// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

library UpdateOfficer {

    enum UpdateType {
        ADDRESS,
        NAME,
        BADGE,
        BRANCH,
        RANK
    }

    struct UpdateRequest {
        address verifiedAddress;
        uint nonce;
        string name;
        bytes32 legalNumber;
        bytes32 badge;
        bytes32 branchId;
        uint rank; 
        UpdateType updateType;
    }

    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "OnboardVote("
        "address verifiedAddress,"
        "uint nonce,"
        "string name,"
        "bytes32 legalNumber,"
        "bytes32 badge,"
        "bytes32 branchId, "
        "uint rank,"
        "UpdateType updateType,"
        ")"
    );

    function hash(UpdateRequest calldata request) public pure returns (bytes32) {
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
                    request.rank,
                    request.updateType
                )
            )
        );
    }

}