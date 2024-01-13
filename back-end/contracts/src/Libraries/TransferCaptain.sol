// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title TransferCaptain
/// @notice A library for handling the transfer of cases between captains.
/// @dev Provides functionality to hash transfer case requests for captains.
library TransferCaptain {

    /// @notice Struct to represent a transfer request between captains.
    /// @dev Contains all necessary details for transferring a case from one captain to another.
    /// @param moderator Address of the moderator overseeing the transfer.
    /// @param fromCaptain Address of the captain currently handling the case.
    /// @param toCaptain Address of the captain to whom the case is being transferred.
    /// @param branchId Branch ID associated with the case.
    /// @param nonce Nonce to ensure uniqueness of the request.
    /// @param caseId The unique identifier of the case being transferred.
    /// @param reciever Boolean indicating if the request is for the receiving captain.
    /// @param expiry Time at which the transfer request expires.
    struct TransferCaptainRequest {
        address moderator;
        address fromCaptain;
        address toCaptain;
        bytes32 branchId;
        uint nonce;
        uint caseId;
        bool reciever;
        uint expiry;
    }

    /// @notice EIP712 type hash for the transfer captain request.
    /// @dev Used for encoding and hashing the transfer captain request struct.
    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "TransferCaptainRequest("
        "address moderator,"
        "address fromCaptain,"
        "address toCaptain,"
        "bytes32 branchId,"
        "uint nonce,"
        "uint caseId,"
        "bool reciever,"
        "uint expiry,"
        ")"
    );

    /// @notice Hashes a `TransferCaptainRequest` request.
    /// @dev Hashes the transfer captain request data using EIP712 encoding.
    /// @param request The `TransferCaptainRequest` request to be hashed.
    /// @return The hash of the encoded transfer captain request.
    function hash(TransferCaptainRequest calldata request) public pure returns (bytes32) {
        return (
            keccak256(
                abi.encode(
                    REQUEST_TYPE_HASH,
                    request.moderator,
                    request.fromCaptain,
                    request.toCaptain,
                    request.branchId,
                    request.nonce,
                    request.caseId,
                    request.reciever,
                    request.expiry
                )
            )
        );
    }
}