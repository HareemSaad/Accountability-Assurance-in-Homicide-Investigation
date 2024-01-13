// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @title Participants
/// @notice A library for managing participants in various cases or scenarios.
/// @dev Provides functionality to hash participant data for verification and logging.
library Participants {

    /// @notice Enum representing different categories of participants.
    /// @dev Used to classify participants in a case.
    /// @param SUSPECT Represents a suspect in a case.
    /// @param WITNESS Represents a witness in a case.
    /// @param PERPETRATOR Represents a perpetrator in a case.
    /// @param VICTIM Represents a victim in a case.
    enum ParticipantCategory {
        SUSPECT,
        WITNESS,
        PERPETRATOR,
        VICTIM
    }

    /// @notice Struct representing a participant.
    /// @dev Contains details about a participant including their ID, category, data, and approval status.
    /// @param participantId Unique identifier for the participant.
    /// @param category The category of the participant.
    /// @param data Arbitrary data associated with the participant.
    /// @param approved Boolean indicating whether the participant is approved.
    struct Participant {
        uint48 participantId;
        ParticipantCategory category;
        bytes data;
        bool approved;
    }

    /// @notice EIP712 type hash for the participant struct.
    /// @dev Used for encoding and hashing the participant struct.
    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "Participant("
        "uint48 participantId,"
        "ParticipantCategory category,"
        "bytes data,"
        "bool approved,"
        ")"
    );

    /// @notice Hashes a `Participant` struct.
    /// @dev Hashes the participant data using EIP712 encoding.
    /// @param data The `Participant` struct to be hashed.
    /// @return The hash of the encoded participant data.
    function hash(Participant calldata data) public pure returns (bytes32) {
        return (
            keccak256(
                abi.encode(
                    REQUEST_TYPE_HASH,
                    data.participantId,
                    data.category,
                    data.data,
                    data.approved
                )
            )
        );
    }
}