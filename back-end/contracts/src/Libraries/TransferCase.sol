// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title TransferCase Library
/// @notice Provides functionalities for handling the transfer of cases between captains in a structured and verifiable manner.
/// @dev This library includes a struct to represent transfer case requests and a function to hash these requests for verification.
library TransferCase {

    /// @dev Struct representing a request to transfer a case from one captain to another.
    /// @param fromCaptain The address of the captain currently handling the case.
    /// @param toCaptain The address of the captain to whom the case will be transferred.
    /// @param nonce A unique identifier to ensure the uniqueness of each transfer request.
    /// @param caseId The unique identifier of the case to be transferred.
    /// @param fromBranchId The identifier of the branch from where the case is being transferred.
    /// @param toBranchId The identifier of the branch to which the case is being transferred.
    /// @param reciever A boolean flag indicating whether the request is for receiving a case (set to true on the receiver's side).
    /// @param expiry The timestamp until which the transfer request is valid.
    struct TransferCaseRequest {
        address fromCaptain;
        address toCaptain;
        uint nonce;
        uint caseId;
        bytes32 fromBranchId;
        bytes32 toBranchId;
        bool reciever;
        uint expiry;
    }

    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "TransferCaseRequest("
        "address fromCaptain,"
        "address toCaptain,"
        "uint nonce,"
        "uint caseId,"
        "bytes32 fromBranchId,"
        "bytes32 toBranchId,"
        "bool reciever,"
        "uint expiry,"
        ")"
    );

    /// @notice Computes the hash of a transfer case request for integrity and non-repudiation.
    /// @dev Uses keccak256 to hash the encoded request data based on the Solidity EIP712 standard.
    /// @param request The `TransferCaseRequest` struct containing the details of the case transfer.
    /// @return bytes32 The hash of the transfer case request, which can be used for signature verification.
    function hash(TransferCaseRequest calldata request) public pure returns (bytes32) {
        return (
            keccak256(
                abi.encode(
                    REQUEST_TYPE_HASH,
                    request.fromCaptain,
                    request.toCaptain,
                    request.nonce,
                    request.caseId,
                    request.fromBranchId,
                    request.toBranchId,
                    request.reciever,
                    request.expiry
                )
            )
        );
    }
}