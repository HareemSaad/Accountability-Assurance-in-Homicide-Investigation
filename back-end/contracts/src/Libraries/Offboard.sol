// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title OfficerOffboard
/// @notice A library for handling the offboarding of officers.
/// @dev This library provides functionality to hash offboarding requests for officers.
library OfficerOffboard {

    /// @notice Struct to represent an offboarding vote for an officer.
    /// @dev Contains all necessary details for an officer's offboarding process.
    /// @param verifiedAddress Address of the officer being offboarded
    /// @param nonce Nonce to ensure uniqueness of the request
    /// @param name Name of the officer
    /// @param legalNumber Legal identification number of the officer
    /// @param badge Badge number of the officer
    /// @param branchId Branch ID where the officer is assigned
    /// @param employmentStatus New employment status of the officer
    /// @param rank Rank of the officer
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

    /// @notice EIP712 type hash for the offboarding request.
    /// @dev Used for encoding and hashing the offboarding request struct.
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

    /// @notice Hashes an `OffboardVote` request.
    /// @dev Hashes the offboard request data using EIP712 encoding.
    /// @param request The `OffboardVote` request to be hashed.
    /// @return The hash of the encoded offboard request.
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