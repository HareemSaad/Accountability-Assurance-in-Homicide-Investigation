// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title TransferBranch
/// @notice A library for handling the transfer of officers between branches.
/// @dev Provides functionality to hash transfer branch requests for officers.
library TransferBranch {

    /// @notice Struct to represent a transfer branch request for an officer.
    /// @dev Contains all necessary details for an officer's transfer process.
    /// @param verifiedAddress Address of the officer being transferred.
    /// @param nonce Nonce to ensure uniqueness of the request.
    /// @param name Name of the officer.
    /// @param legalNumber Legal identification number of the officer.
    /// @param badge Badge number of the officer.
    /// @param branchId Current branch ID of the officer.
    /// @param toBranchId Destination branch ID for the transfer.
    /// @param employmentStatus Employment status of the officer.
    /// @param rank Rank of the officer.
    /// @param reciever Boolean indicating if the request is for the receiving branch.
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

    /// @notice EIP712 type hash for the transfer branch request.
    /// @dev Used for encoding and hashing the transfer branch request struct.
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

    /// @notice Hashes a `TransferBranchRequest` request.
    /// @dev Hashes the transfer branch request data using EIP712 encoding.
    /// @param request The `TransferBranchRequest` request to be hashed.
    /// @return The hash of the encoded transfer branch request.
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