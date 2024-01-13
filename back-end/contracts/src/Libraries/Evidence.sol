// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title Evidences
/// @notice A library for handling evidence items in legal cases or investigations.
/// @dev Provides functionality to hash evidence data for verification and logging.
library Evidences {
    
    /// @notice Enum representing different categories of evidence.
    /// @dev Used to classify evidence in legal cases or investigations.
    /// @param WEAPON Represents a weapon used in a case.
    /// @param PHYSICAL Represents physical evidence.
    /// @param DRUG Represents drug-related evidence.
    /// @param DOCUMENTARY Represents documentary evidence.
    /// @param DEMONSTRATIVE Represents demonstrative evidence.
    /// @param HEARSAY Represents hearsay evidence.
    /// @param MURDER_WEAPON Represents a weapon specifically used in a murder case.
    enum EvidenceCategory {
        WEAPON, 
        PHYSICAL, 
        DRUG, 
        DOCUMENTARY, 
        DEMONSTRATIVE, 
        HEARSAY, 
        MURDER_WEAPON
    }

    /// @notice Struct representing an evidence item.
    /// @dev Contains details about an evidence item including its ID, category, data, and approval status.
    /// @param evidenceId Unique identifier for the evidence.
    /// @param category The category of the evidence.
    /// @param data Arbitrary data associated with the evidence.
    /// @param approved Boolean indicating whether the evidence is approved.
    struct Evidence {
        uint48 evidenceId;
        EvidenceCategory category;
        bytes data;
        bool approved;
    }

    /// @notice EIP712 type hash for the evidence struct.
    /// @dev Used for encoding and hashing the evidence struct.
    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "Evidence("
        "uint48 evidenceId,"
        "ParticipantCategory category,"
        "bytes data,"
        "bool approved,"
        ")"
    );

    /// @notice Hashes an `Evidence` struct.
    /// @dev Hashes the evidence data using EIP712 encoding.
    /// @param data The `Evidence` struct to be hashed.
    /// @return The hash of the encoded evidence data.
    function hash(Evidence calldata data) public pure returns (bytes32) {
        return (
            keccak256(
                abi.encode(
                    REQUEST_TYPE_HASH,
                    data.evidenceId,
                    data.category,
                    data.data,
                    data.approved
                )
            )
        );
    }
}