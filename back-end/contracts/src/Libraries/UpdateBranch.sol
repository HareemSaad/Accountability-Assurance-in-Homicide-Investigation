// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title UpdateBranch
/// @notice A library for handling the updating of branch details in a contract.
/// @dev Provides functionality to hash update branch requests.
library UpdateBranch {

    /// @notice Struct to represent an update branch vote.
    /// @dev Contains all necessary details for updating branch information.
    /// @param nonce Nonce to ensure uniqueness of the request.
    /// @param precinctAddress New physical address of the branch.
    /// @param jurisdictionArea New jurisdiction area of the branch.
    /// @param stateCode State code where the branch is located.
    /// @param branchId Unique identifier of the branch being updated.
    struct UpdateBranchVote {
        uint nonce;
        string precinctAddress;
        uint jurisdictionArea;
        uint stateCode;
        bytes32 branchId;
        uint expiry;
    }

    /// @notice EIP712 type hash for the update branch request.
    /// @dev Used for encoding and hashing the update branch request struct.
    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "UpdateBranchVote("
        "uint nonce,"
        "string precinctAddress,"
        "uint jurisdictionArea,"
        "uint stateCode,"
        "bytes32 branchId,"
        "uint expiry,"
        ")"
    );

    /// @notice Hashes an `UpdateBranchVote` request.
    /// @dev Hashes the update branch request data using EIP712 encoding.
    /// @param request The `UpdateBranchVote` request to be hashed.
    /// @return The hash of the encoded update branch request.
    function hash(UpdateBranchVote calldata request) public pure returns (bytes32) {
        return (
            keccak256(
                abi.encode(
                    REQUEST_TYPE_HASH,
                    request.nonce,
                    request.precinctAddress,
                    request.jurisdictionArea,
                    request.stateCode,
                    request.branchId,
                    request.expiry
                )
            )
        );
    }
}