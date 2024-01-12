// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title CreateBranch
/// @notice A library for creating a new branch in a contract.
/// @dev Provides functionality to hash create branch requests.
library CreateBranch {

    /// @notice Struct to represent a create branch vote.
    /// @dev Contains all necessary details for creating a new branch.
    /// @param nonce Nonce to ensure uniqueness of the request
    /// @param precinctAddress Physical address of the new branch
    /// @param jurisdictionArea Jurisdiction area of the new branch e.g. zip code / area code
    /// @param stateCode State code where the new branch will be located e.g. city code
    /// @param branchId Unique identifier for the new branch
    struct CreateBranchVote {
        uint nonce;
        string precinctAddress;
        uint jurisdictionArea;
        uint stateCode;
        bytes32 branchId;
        uint expiry;
    }

    /// @notice EIP712 type hash for the create branch request.
    /// @dev Used for encoding and hashing the create branch request struct.
    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "CreateBranchVote("
        "uint nonce,"
        "string precinctAddress,"
        "uint jurisdictionArea,"
        "uint stateCode,"
        "bytes32 branchId,"
        "uint expiry,"
        ")"
    );

    /// @notice Hashes a `CreateBranchVote` request.
    /// @dev Hashes the create branch request data using EIP712 encoding.
    /// @param request The `CreateBranchVote` request to be hashed.
    /// @return The hash of the encoded create branch request.
    function hash(CreateBranchVote calldata request) public pure returns (bytes32) {
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
