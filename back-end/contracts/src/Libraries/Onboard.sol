// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title OfficerOnboard
/// @notice A library for handling the onboarding of officers.
/// @dev Provides functionality to hash onboarding requests for officers.
library OfficerOnboard {

    /// @notice Struct to represent an onboarding vote for an officer.
    /// @dev Contains all necessary details for an officer's onboarding process.
    /// @param verifiedAddress Address of the officer being onboarded.
    /// @param nonce Nonce to ensure uniqueness of the request.
    /// @param name Name of the officer.
    /// @param legalNumber Legal identification number of the officer.
    /// @param badge Badge number of the officer.
    /// @param branchId Branch ID where the officer will be assigned.
    /// @param employmentStatus Employment status to be assigned to the officer.
    /// @param rank Rank to be assigned to the officer.
    struct OnboardVote {
        address verifiedAddress;
        uint nonce;
        string name;
        bytes32 legalNumber;
        bytes32 badge;
        bytes32 branchId;
        uint employmentStatus;
        uint rank;
        uint expiry;
    }

    /// @notice EIP712 type hash for the onboarding request.
    /// @dev Used for encoding and hashing the onboarding request struct.
    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "OnboardVote("
        "address verifiedAddress,"
        "uint nonce,"
        "string name,"
        "bytes32 legalNumber,"
        "bytes32 badge,"
        "bytes32 branchId,"
        "uint employmentStatus,"
        "uint rank,"
        "uint expiry,"
        ")"
    );

    /// @notice Hashes an `OnboardVote` request.
    /// @dev Hashes the onboarding request data using EIP712 encoding.
    /// @param request The `OnboardVote` request to be hashed.
    /// @return The hash of the encoded onboarding request.
    function hash(OnboardVote calldata request) public pure returns (bytes32) {
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
                    request.rank,
                    request.expiry
                )
            )
        );
    }
}