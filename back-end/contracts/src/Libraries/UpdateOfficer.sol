// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title UpdateOfficer
/// @notice A library for handling the updates of officer details in a contract.
/// @dev Provides functionality to hash update officer requests.
library UpdateOfficer {

    /// @notice Enum to represent the type of update being performed.
    /// @dev Used to specify the kind of update (address, name, or badge) for an officer.
    /// @param ADDRESS Update the officer's address
    /// @param NAME Update the officer's name
    /// @param BADGE Update the officer's badge number
    enum UpdateType {
        ADDRESS,
        NAME,
        BADGE
    }

    /// @notice Struct to represent an update request for an officer.
    /// @dev Contains all necessary details for updating officer information.
    /// @param verifiedAddress Address of the officer being updated.
    /// @param nonce Nonce to ensure uniqueness of the request.
    /// @param name New name of the officer (if applicable).
    /// @param legalNumber Legal identification number of the officer.
    /// @param badge New badge number of the officer (if applicable).
    /// @param branchId Branch ID of the officer.
    /// @param rank Rank of the officer.
    /// @param updateType Type of update being requested (address, name, badge).
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

    /// @notice EIP712 type hash for the update officer request.
    /// @dev Used for encoding and hashing the update officer request struct.
    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "OnboardVote("
        "address verifiedAddress,"
        "uint nonce,"
        "string name,"
        "bytes32 legalNumber,"
        "bytes32 badge,"
        "bytes32 branchId,"
        "uint rank,"
        "UpdateType updateType,"
        ")"
    );

    /// @notice Hashes an `UpdateRequest` request.
    /// @dev Hashes the update officer request data using EIP712 encoding.
    /// @param request The `UpdateRequest` request to be hashed.
    /// @return The hash of the encoded update officer request.
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