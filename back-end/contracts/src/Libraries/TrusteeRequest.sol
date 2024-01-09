// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title TrusteeRequestLib
/// @notice A library for handling trustee requests in a decentralized system.
/// @dev Provides functionality to hash trustee request data structures.
library TrusteeRequestLib {

    /// @notice Struct to represent a trustee request.
    /// @dev Contains all necessary details for processing a trustee request.
    /// @param caseId The unique identifier for the case associated with the request.
    /// @param trustee The address of the trustee involved in the request.
    /// @param captain The address of the captain authorizing or involved in the request.
    /// @param branchId The branch ID associated with the request.
    struct TrusteeRequest {
        uint caseId;
        address trustee;
        address captain;
        bytes32 branchId;
    }

    /// @notice EIP712 type hash for the trustee request.
    /// @dev Used for encoding and hashing the trustee request struct.
    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "TrusteeRequest("
        "uint caseId,"
        "address trustee,"
        "address captain,"
        "bytes32 branchId,"
        ")"
    );

    /// @notice Hashes a `TrusteeRequest` request.
    /// @dev Hashes the trustee request data using EIP712 encoding.
    /// @param request The `TrusteeRequest` request to be hashed.
    /// @return The hash of the encoded trustee request.
    function hash(TrusteeRequest calldata request) public pure returns (bytes32) {
        return (
            keccak256(
                abi.encode(
                    REQUEST_TYPE_HASH,
                    request.caseId,
                    request.trustee,
                    request.captain,
                    request.branchId
                )
            )
        );
    }
}