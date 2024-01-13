// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./Ledger.sol";
import "./Libraries/TrusteeRequest.sol";
import "./Libraries/Participant.sol";
import "./Libraries/TransferCaptain.sol";
import "./Libraries/Evidence.sol";

/**
 * @title Cases
 * @notice A smart contract for managing and tracking legal cases.
 * This contract provides functionality for creating and updating cases, managing officers, adding participants and evidence to cases,
 * and verifying the integrity of data through signatures and data hashing.
 * @dev This contract is designed to work in conjunction with the Ledger contracts.
 */
contract Cases is EIP712 {

    using Strings for string;
    using TrusteeRequestLib for TrusteeRequestLib.TrusteeRequest;
    using TransferCaptain for TransferCaptain.TransferCaptainRequest;
    using Participants for Participants.Participant;
    using Evidences for Evidences.Evidence;

    Ledger ledgersContract;
    
    /**
     * @dev Emitted when a case is created or updated.
     * @dev `caseId` The identifier of the case being updated.
     * @dev `initiator` The address of the officer initiating the status update.
     * @dev `oldStatus` The previous status of the case.
     * @dev `newStatus` The new status of the case.
     */
    event CaseUpdated(
        uint indexed caseId, 
        address indexed initiator, 
        bytes32 branch,
        CaseStatus oldStatus, 
        CaseStatus indexed newStatus
    );
    
    /**
     * @dev Emitted when an officer is added to or removed from a case.
     * @dev `caseId` The identifier of the case to which an officer is added.
     * @dev `initiator` The address of the officer initiating the addition.
     * @dev `officer` The address of the officer being added.
     */
    event UpdateOfficerInCase(
        uint caseId, 
        address indexed initiator, 
        address indexed officer
    );

    /**
     * @dev Emitted when an officer is removed from a case.
     * @dev `caseId` The identifier of the case from which an officer is removed.
     * @dev `initiator` The address of the officer initiating the removal.
     * @dev `officer` The address of the officer being removed.
     * @dev `caseSpecificOfficerId` The unique identifier for the officer within the case.
     */
    event RemoveOfficer(
        uint caseId, 
        address indexed initiator, 
        address indexed officer
    );

    /**
     * @dev Emitted when a new participant is added to a case.
     * @dev `caseId` The identifier of the case to which the participant is added.
     * @dev `initiator` The address of the officer initiating the addition.
     * @dev `suspectId` The unique identifier for the participant in the case.
     * @dev `category` The category of the participant (e.g., SUSPECT, WITNESS, PERPETRATOR, VICTIM).
     * @dev `dataHash` The hash of the participant's data for data integrity verification.
     * @dev `data` The data associated with the participant.
     */
    event NewParticipantInCase(
        uint caseId, 
        address indexed initiator, 
        uint48 suspectId, 
        Participants.ParticipantCategory category, 
        bytes32 dataHash, 
        bytes data
    );
    
    /**
     * @dev Emitted when new evidence is added to a case.
     * @dev `caseId` The identifier of the case to which evidence is added.
     * @dev `initiator` The address of the officer initiating the addition.
     * @dev `evidenceId` The unique identifier for the evidence in the case.
     * @dev `category` The category of the evidence (e.g., WEAPON, PHYSICAL, DRUG, DOCUMENTARY, etc.).
     * @dev `dataHash` The hash of the evidence's data for data integrity verification.
     * @dev `data` The data associated with the evidence.
     */
    event NewEvidenceInCase(
        uint caseId, 
        address indexed initiator, 
        uint48 evidenceId, 
        Evidences.EvidenceCategory category, 
        bytes32 dataHash, 
        bytes data
    );
    
    /**
     * @dev Emitted when trustee access is updated
     * @dev `caseId` The identifier of the case to which evidence is added.
     * @dev `initiator` The address of the officer initiating the addition.
     * @dev `trustree` The address of the person who whose read access gets revoked or granted.
     * @dev `approved` True for granted access, False for revoked access
     */
    event Trustee(
        uint caseId, 
        bytes32 indexed branchId, 
        address indexed initiator, 
        address indexed trustree, 
        bool approved
    );

    /// @notice Emitted when a participant is approved to be part of a case.
    /// @param participantId The unique identifier of the participant who is approved.
    event ParticipantApproved(uint48 participantId);

    /// @notice Emitted when a piece of evidence is approved for inclusion in a case.
    /// @param evidenceId The unique identifier of the evidence that is approved.
    event EvidenceApproved(uint48 evidenceId);
    
    /// @notice Represents the possible statuses of a legal case.
    /// @param NULL Indicates an uninitialized or non-existent case.
    /// @param OPEN Indicates an active, ongoing case.
    /// @param CLOSED Indicates a case that has been resolved.
    /// @param COLD Indicates a case that is inactive, typically due to lack of leads or evidence.
    enum CaseStatus {
        NULL,
        OPEN,
        CLOSED,
        COLD
    }

    /// @notice A struct representing a legal case.
    /// @param status The current status of the case (Open, Closed, Cold, or Null).
    /// @param branch The identifier of the branch handling the case.
    /// @param officers A mapping of officer addresses to their assignment status in the case.
    /// @param participants A mapping of participant IDs to their details.
    /// @param evidences A mapping of evidence IDs to their details.
    struct Case {
        CaseStatus status;
        bytes32 branch;
        mapping (address => bool) officers;
        mapping (uint48 => Participants.Participant) participants;
        mapping (uint48 => Evidences.Evidence) evidences;
    }

    /// @notice Contract constructor that sets up the initial ledger contract.
    /// @param _ledgersContract The address of the associated Ledger contract.
    constructor(address _ledgersContract) EIP712("Cases", "1") {
        ledgersContract = Ledger(_ledgersContract);
    }

    /// @notice A mapping of case IDs to their corresponding Case structs.
    mapping (uint => Case) public _case;

    /// @dev trustee address => case Id => T/F
    mapping (address => mapping (uint => bool)) trusteeLedger;

    /// @dev saves executed transactions to protect against replay
    mapping (bytes32 => bool) public replay;
    
    /// @notice Restricts function access to officers of a specific rank.
    /// @dev Utilizes the _onlyRank internal function for the actual check.
    /// @param rank The required rank for accessing the function.
    modifier onlyRank(Ledger.Rank rank) {
        _onlyRank(rank);
        _;
    }

    /// @notice Internal function to check if the message sender has the specified rank.
    /// @dev Checks if the sender's rank matches the specified rank using the Ledger contract.
    /// @param rank The rank to check against the sender's rank.
    function _onlyRank(Ledger.Rank rank) internal view {
        if (!ledgersContract.isValidRank(msg.sender, rank)) { 
            revert InvalidRank(); 
        }
    }

    function officerInCase(uint _caseId, address _officer) external view returns(bool) {
        return _case[_caseId].officers[_officer];
    }

    /// @notice Creates a new legal case with the specified ID and branch.
    /// @param _caseId The unique identifier for the new case.
    /// @param _branch The branch ID associated with the new case.
    /// @dev The caller must have the 'CAPTAIN' role to create a case.
    /// @dev Throws `InvalidCase` if a case with the given `_caseId` already exists.
    /// @dev Throws `InvalidBranch` if the given `_branch` does not exist or is invalid.
    function addCase(uint _caseId, bytes32 _branch) external onlyRank(Ledger.Rank.CAPTAIN) {

        (,,uint stateCode,) = ledgersContract.branches(_branch);

        if(_case[_caseId].status != CaseStatus.NULL) { revert InvalidCase(); }
        if(stateCode == 0) revert InvalidBranch();

        Case storage newCase = _case[_caseId];
        newCase.status = CaseStatus.OPEN;
        newCase.branch = _branch;
        newCase.officers[msg.sender] = true;

        emit CaseUpdated(_caseId, msg.sender, _branch, CaseStatus.NULL, CaseStatus.OPEN);
    }

    /// @notice Updates the status of an existing case.
    /// @param _caseId The identifier of the case to be updated.
    /// @param _status The new status to set for the case.
    /// @dev The caller must have the 'CAPTAIN' role and be assigned to the case.
    /// @dev Throws `InvalidCase` if the case with the given `_caseId` does not exist.
    /// @dev Throws `InvalidOfficer` if the caller is not an assigned officer of the case.
    function updateCaseStatus(uint _caseId, CaseStatus _status) external onlyRank(Ledger.Rank.CAPTAIN) {
        Case storage newCase = _case[_caseId];

        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(!newCase.officers[msg.sender]) { revert InvalidOfficer(); }

        CaseStatus oldStatus = newCase.status;
        newCase.status = _status;

        emit CaseUpdated(_caseId, msg.sender, newCase.branch, oldStatus, _status);
    }

    /// @notice Adds an officer to a case.
    /// @param _caseId The identifier of the case to which an officer is added.
    /// @param _officer The address of the officer to be added.
    /// @dev The caller must have the 'CAPTAIN' role for the specified case.
    /// @dev Throws `InvalidCase` if the case is not OPEN.
    /// @dev Throws `InvalidOfficer` if the caller is not an assigned officer or if the officer to be added is invalid.
    /// @dev Throws `BranchMismatch` if the officer's branch does not match the case's branch.
    function addOfficerInCase(uint _caseId, address _officer) external onlyRank(Ledger.Rank.CAPTAIN) {

        Case storage newCase = _case[_caseId];
        (
            ,,,bytes32 fromBranchId,,Ledger.Rank _rank
        ) = ledgersContract.officers(_officer);
        
        if(newCase.status != CaseStatus.OPEN) { revert InvalidCase(); }
        if(!newCase.officers[msg.sender]) { revert InvalidOfficer(); }
        if(_rank == Ledger.Rank.NULL || _rank == Ledger.Rank.MODERATOR) { revert InvalidOfficer(); }
        if(!(fromBranchId == newCase.branch)) revert BranchMismatch();
        
        newCase.officers[_officer] = true; 

        emit UpdateOfficerInCase(_caseId, msg.sender, _officer);
    }

    /// @notice Transfers the assigned captain of a case.
    /// @param params Parameters for the transfer request.
    /// @dev The caller must have the 'Moderator' role for the specified case.
    /// @dev Throws `InvalidCase` if the case does not exist or is NULL.
    /// @dev Throws `InvalidOfficer` if the current captain is not an officer of the case.
    /// @dev Throws `InvalidRank`, `InactiveOfficer`, or `BranchMismatch` for invalid captain details.
    /// @dev Throws `InvalidSigner` if signers are not the current and new captains.
    function transferCaseCaptain(
        TransferCaptain.TransferCaptainRequest memory params,
        bytes[2] memory _signatures,
        address[2] memory _signers
    ) external onlyRank(Ledger.Rank.MODERATOR) {

        Case storage newCase = _case[params.caseId];
        
        (
            ,,,
            bytes32 fromBranchId, 
            Ledger.EmploymentStatus fromEmploymentStatus, 
            Ledger.Rank fromRank
        ) = ledgersContract.officers(params.fromCaptain);

        (
            ,,,
            bytes32 toBranchId, 
            Ledger.EmploymentStatus toEmploymentStatus, 
            Ledger.Rank toRank
        ) = ledgersContract.officers(params.toCaptain);

        
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(!newCase.officers[params.fromCaptain]) { revert InvalidOfficer(); }
        if(!(fromRank == toRank && fromRank == Ledger.Rank.CAPTAIN)) { revert InvalidRank(); }
        if(!(fromEmploymentStatus == toEmploymentStatus && fromEmploymentStatus == Ledger.EmploymentStatus.ACTIVE)) { revert InactiveOfficer(); }
        if(!(toBranchId == fromBranchId && toBranchId == newCase.branch)) { revert BranchMismatch(); }
        if(!(_signers[0] == params.fromCaptain && _signers[1] == params.toCaptain)) { revert InvalidSigner(); }

        bytes32 messageHash = params.hash();
        _validateSignatures(messageHash, _signatures[0], _signers[0]);

        params.reciever = true;
        
        messageHash = params.hash();
        _validateSignatures(messageHash, _signatures[1], _signers[1]);

        delete(newCase.officers[params.fromCaptain]);
        newCase.officers[params.toCaptain] = true;

        emit UpdateOfficerInCase(params.caseId, params.fromCaptain, params.toCaptain);

        delete(fromBranchId);
        delete(toBranchId);
        delete(fromEmploymentStatus);
        delete(toEmploymentStatus);
        delete(fromRank);
        delete(toRank);
    }

    //// @notice Removes an officer from a case.
    /// @param _caseId The identifier of the case from which an officer is removed.
    /// @param _officer The address of the officer to be removed.
    /// @dev The caller must have the 'CAPTAIN' role for the specified case.
    /// @dev Throws `InvalidOfficer` if the officer is not assigned to the case.
    /// @dev Throws `InvalidCase` if the case does not exist or is NULL.
    function removeOfficerInCase(uint _caseId, address _officer) external onlyRank(Ledger.Rank.CAPTAIN) {

        Case storage newCase = _case[_caseId];
        
        if(!newCase.officers[_officer]) { revert InvalidOfficer(); } //check if officer is assigned this case
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }

        delete(newCase.officers[_officer]);

        emit RemoveOfficer(_caseId, msg.sender, _officer);
    }

    /// @notice Adds a participant to a case.
    /// @param _caseId The identifier of the case to which the participant is added.
    /// @param _participant The participant's data and signature.
    /// @dev The caller must be an officer assigned to the specified case.
    /// @dev Throws `InvalidOfficer` if the caller is not an assigned officer.
    /// @dev Throws `InvalidCase` if the case is NULL or not existing.
    /// @dev Throws `HasToBeApproved` if the participant is not pre-approved.
    /// @dev Throws `InvalidSigner` or `InvalidSender` if the employment status is not ACTIVE.
    /// @dev Throws `BranchMismatch` if the signer and sender are from different branches.
    /// @dev Throws `InvalidCaptain` if the signer is not an assigned officer of the case.
    function addParticipant(
        uint _caseId, 
        Participants.Participant memory _participant,
        bytes memory _signature,
        address _signer
    ) external {

        Case storage newCase = _case[_caseId];

        (
            ,,,
            bytes32 capBranchId, 
            Ledger.EmploymentStatus capEmploymentStatus,
        ) = ledgersContract.officers(_signer);

        (
            ,,,
            bytes32 fromBranchId, 
            Ledger.EmploymentStatus fromEmploymentStatus,
        ) = ledgersContract.officers(msg.sender);

        if(!newCase.officers[msg.sender]) { revert InvalidOfficer(); } //check if officer is assigned this case
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(!_participant.approved) { revert HasToBeApproved(); }
        if(!(capEmploymentStatus == Ledger.EmploymentStatus.ACTIVE)) revert InvalidSigner();
        if(!(fromEmploymentStatus == Ledger.EmploymentStatus.ACTIVE)) revert InvalidSender();
        if(!(capBranchId == fromBranchId)) revert BranchMismatch();
        if(!(newCase.officers[_signer])) revert InvalidCaptain();

        bytes32 messageHash = _participant.hash();
        _validateSignatures(messageHash, _signature, _signer);

        newCase.participants[_participant.participantId] = _participant;

        emit NewParticipantInCase(
            _caseId, 
            msg.sender, 
            _participant.participantId, 
            _participant.category,
            messageHash, 
            _participant.data
        );

        emit ParticipantApproved(_participant.participantId);
    }    
    
    /// @notice Adds a participant to a case without approval requirement.
    /// @param _caseId The identifier of the case to which the participant is added.
    /// @param _participant The participant's data.
    /// @dev The caller must be an officer assigned to the specified case.
    /// @dev Throws `InvalidOfficer` if the caller is not an assigned officer.
    /// @dev Throws `InvalidCase` if the case is NULL or not existing.
    /// @dev Throws `CannotBePreApproved` if the participant is pre-approved.
    /// @dev Throws `InvalidSender` if the employment status of the caller is not ACTIVE.
    function addParticipant(
        uint _caseId, 
        Participants.Participant memory _participant
    ) external {

        Case storage newCase = _case[_caseId];

        (
            ,,,, 
            Ledger.EmploymentStatus fromEmploymentStatus,
        ) = ledgersContract.officers(msg.sender);

        if(!newCase.officers[msg.sender]) { revert InvalidOfficer(); } //check if officer is assigned this case
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(_participant.approved) { revert CannotBePreApproved(); }
        if(!(fromEmploymentStatus == Ledger.EmploymentStatus.ACTIVE)) revert InvalidSender();

        bytes32 messageHash = _participant.hash();

        newCase.participants[_participant.participantId] = _participant;

        emit NewParticipantInCase(
            _caseId, 
            msg.sender, 
            _participant.participantId, 
            _participant.category, 
            messageHash, 
            _participant.data
        );
    }

    /// @notice Approves a participant in a case.
    /// @param _caseId The identifier of the case to which the participant is added.
    /// @param _participant The participant's data.
    /// @dev The caller must have the 'CAPTAIN' role for the specified case.
    /// @dev Throws `InvalidOfficer` if the caller is not an assigned officer.
    /// @dev Throws `InvalidCase` if the case is NULL or not existing.
    /// @dev Throws `AlreadyApproved` if the participant is already approved.
    /// @dev Throws `InvalidSender` if the employment status of the caller is not ACTIVE.
    function approveParticipant(
        uint _caseId, 
        Participants.Participant memory _participant
    ) external onlyRank(Ledger.Rank.CAPTAIN) {

        Case storage newCase = _case[_caseId];

        (
            ,,,, 
            Ledger.EmploymentStatus fromEmploymentStatus,
        ) = ledgersContract.officers(msg.sender);

        if(!newCase.officers[msg.sender]) { revert InvalidOfficer(); } //check if officer is assigned this case
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(newCase.participants[_participant.participantId].approved) { revert AlreadyApproved(); }
        if(!(fromEmploymentStatus == Ledger.EmploymentStatus.ACTIVE)) revert InvalidSender();

        newCase.participants[_participant.participantId].approved = true;

        emit ParticipantApproved(_participant.participantId);
    }

    /// @notice Adds evidence to a case with approval requirement.
    /// @param _caseId The identifier of the case to which evidence is added.
    /// @param _evidence The evidence's data and signature.
    /// @param _signature Signature of the captain authorizing the evidence addition.
    /// @param _signer Address of the captain performing the addition.
    /// @dev The caller must be an officer assigned to the specified case.
    /// @dev Throws InvalidOfficer if the caller is not an assigned officer.
    /// @dev Throws InvalidCase if the case is NULL or not existing.
    /// @dev Throws HasToBeApproved if the evidence is not pre-approved.
    /// @dev Throws InvalidSigner or InvalidSender if the employment status is not ACTIVE.
    /// @dev Throws BranchMismatch if the signer and sender are from different branches.
    /// @dev Throws InvalidCaptain if the signer is not an assigned officer of the case.
    function addEvidence(
        uint _caseId, 
        Evidences.Evidence memory _evidence, 
        bytes memory _signature,
        address _signer
    ) external {

        Case storage newCase = _case[_caseId];

        (
            ,,,
            bytes32 capBranchId, 
            Ledger.EmploymentStatus capEmploymentStatus,
        ) = ledgersContract.officers(_signer);

        (
            ,,,
            bytes32 fromBranchId, 
            Ledger.EmploymentStatus fromEmploymentStatus,
        ) = ledgersContract.officers(msg.sender);

        if(!newCase.officers[msg.sender]) { revert InvalidOfficer(); } //check if officer is assigned this case
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(!_evidence.approved) { revert HasToBeApproved(); }
        if(!(capEmploymentStatus == Ledger.EmploymentStatus.ACTIVE)) revert InvalidSigner();
        if(!(fromEmploymentStatus == Ledger.EmploymentStatus.ACTIVE)) revert InvalidSender();
        if(!(capBranchId == fromBranchId)) revert BranchMismatch();
        if(!(newCase.officers[_signer])) revert InvalidCaptain();

        bytes32 messageHash = _evidence.hash();
        _validateSignatures(messageHash, _signature, _signer);

        newCase.evidences[_evidence.evidenceId] = _evidence;

        emit NewEvidenceInCase(_caseId, msg.sender, _evidence.evidenceId, _evidence.category, messageHash, _evidence.data);
        
        emit EvidenceApproved(_evidence.evidenceId);
    }
    
    /// @notice Adds evidence to a case without approval requirement.
    /// @param _caseId The identifier of the case to which evidence is added.
    /// @param _evidence The evidence's data.
    /// @dev The caller must be an officer assigned to the specified case.
    /// @dev Throws `InvalidOfficer` if the caller is not an assigned officer.
    /// @dev Throws `InvalidCase` if the case is NULL or not existing.
    /// @dev Throws `CannotBePreApproved` if the evidence is pre-approved.
    /// @dev Throws `InvalidSender` if the employment status of the caller is not ACTIVE.
    function addEvidence(
        uint _caseId, 
        Evidences.Evidence memory _evidence
    ) external {

        Case storage newCase = _case[_caseId];

        (
            ,,,, 
            Ledger.EmploymentStatus fromEmploymentStatus,
        ) = ledgersContract.officers(msg.sender);

        if(!newCase.officers[msg.sender]) { revert InvalidOfficer(); } //check if officer is assigned this case
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(_evidence.approved) { revert CannotBePreApproved(); }
        if(!(fromEmploymentStatus == Ledger.EmploymentStatus.ACTIVE)) revert InvalidSender();

        bytes32 messageHash = _evidence.hash();

        newCase.evidences[_evidence.evidenceId] = _evidence;

        emit NewEvidenceInCase(_caseId, msg.sender, _evidence.evidenceId, _evidence.category, messageHash, _evidence.data);
    }
    
    /// @notice Approves evidence in a case without approval.
    /// @param _caseId The identifier of the case to which the evidence is approved.
    /// @param _evidence The evidence's data.
    /// @dev The caller must have the 'CAPTAIN' role for the specified case.
    /// @dev Throws `InvalidOfficer` if the caller is not an assigned officer.
    /// @dev Throws InvalidCase if the case is NULL or not existing.
    /// @dev Throws AlreadyApproved if the evidence is already approved.
    /// @dev Throws InvalidSender if the employment status of the caller is not ACTIVE.
    function approveEvidence(
        uint _caseId, 
        Evidences.Evidence memory _evidence
    ) external onlyRank(Ledger.Rank.CAPTAIN) {

        Case storage newCase = _case[_caseId];

        (
            ,,,, 
            Ledger.EmploymentStatus fromEmploymentStatus,
        ) = ledgersContract.officers(msg.sender);

        if(!newCase.officers[msg.sender]) { revert InvalidOfficer(); } //check if officer is assigned this case
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(newCase.evidences[_evidence.evidenceId].approved) { revert AlreadyApproved(); }
        if(!(fromEmploymentStatus == Ledger.EmploymentStatus.ACTIVE)) revert InvalidSender();

        newCase.evidences[_evidence.evidenceId].approved = true;

        emit EvidenceApproved(_evidence.evidenceId);
    }

    /// @notice Grants trustee access to a specific case.
    /// @param _params Parameters for the trustee request.
    /// @param _signature Signature of the moderator authorizing the access.
    /// @dev The caller must have the 'CAPTAIN' role.
    /// @dev Throws `InvalidAddress` if trustee or moderator address is zero.
    /// @dev Throws `InvalidBranch` if the branch does not exist.
    /// @dev Throws `InvalidCase` if the case does not exist.
    /// @dev Throws `AccessAlreadyGranted` if trustee access is already granted.
    /// @dev Throws `Expired` if the request has expired.
    /// @dev Throws `InvalidSignature` if the signature verification fails.
    function grantTrusteeAccess(
        TrusteeRequestLib.TrusteeRequest memory _params, 
        bytes memory _signature
    ) external onlyRank(Ledger.Rank.CAPTAIN) {

        _validateExpiry(_params.expiry);
        
        if(address(0) == _params.trustee || _params.moderator == address(0)) { revert InvalidAddress(); }

        Case storage currCase = _case[_params.caseId];
        (,,uint stateCode,) = ledgersContract.branches(_params.branchId);

        if(stateCode == 0) revert InvalidBranch();
        if(currCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(trusteeLedger[_params.trustee][_params.caseId]) { revert AccessAlreadyGranted(); }

        bytes32 messageHash = _params.hash();
        _validateSignature(_signature, messageHash, _params.moderator);

        trusteeLedger[_params.trustee][_params.caseId] = true;
        
        emit Trustee(_params.caseId, _params.branchId, msg.sender, _params.trustee, true);
    }

    /// @notice Revokes trustee access from a specific case.
    /// @param _trustee Address of the trustee.
    /// @param _caseId Identifier of the case.
    /// @param _branchId Branch identifier related to the case.
    /// @dev The caller must have the 'CAPTAIN' role.
    /// @dev Throws `InvalidAddress` if the trustee address is zero.
    /// @dev Throws `InvalidCase` if the case does not exist.
    /// @dev Throws `NoAccessToRevoke` if the trustee does not have access to the case.
    function revokeTrusteeAccess(address _trustee, uint _caseId, bytes32 _branchId) external onlyRank(Ledger.Rank.CAPTAIN) {
        
        if(address(0) == _trustee) { revert InvalidAddress(); }

        Case storage currCase = _case[_caseId];
        if(currCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(!trusteeLedger[_trustee][_caseId]) { revert NoAccessToRevoke(); }

        trusteeLedger[_trustee][_caseId] = false;
        
        emit Trustee(_caseId, _branchId, msg.sender, _trustee, false);
    }

    /// @dev Validates a given signature against a hash and a signer.
    /// @param _signature Signature to be validated.
    /// @param _hash Hash of the data signed.
    /// @param _signer Address of the signer to validate against.
    /// @dev Throws `InvalidSignature` if the signature does not match the signer.
    function _validateSignature(bytes memory _signature, bytes32 _hash, address _signer) internal pure {
        if (ECDSA.recover(_hash, _signature) == _signer) { revert InvalidSignature(); }
    }

    /// @dev Validates a set of signatures.
    /// @param _hash The hash of the data being signed.
    /// @param _signatures Array of signatures to validate.
    /// @param _signers Array of addresses corresponding to the signers of the signatures.
    function _validateSignatures(
        bytes32 _hash,
        bytes[] memory _signatures,
        address[] memory _signers
    ) private {
        bytes32 _messageHash = _hashTypedDataV4(_hash);
        if (replay[_messageHash]) revert SignatureReplay();
        replay[_messageHash] = true;
        for (uint i = 0; i < _signatures.length; ++i) {
            if(!(
                SignatureChecker.isValidSignatureNow(_signers[i], _messageHash, _signatures[i])
            )) revert InvalidSignature();
        }   
    }

    /// @dev Validates a single signature.
    /// @param _hash The hash of the data being signed.
    /// @param _signature The signature to validate.
    /// @param _signer The address of the signer of the signature.
    function _validateSignatures(
        bytes32 _hash,
        bytes memory _signature,
        address _signer
    ) private {
        bytes32 _messageHash = _hashTypedDataV4(_hash);
        if (replay[_messageHash]) revert SignatureReplay();
        replay[_messageHash] = true;
        if(!(
            SignatureChecker.isValidSignatureNow(_signer, _messageHash, _signature)
        )) revert InvalidSignature();
    }

    /// @notice validates expiry date
    /// @dev throws if expired
    /// @param _expiry expiry timestamp
    function _validateExpiry(uint _expiry) private view {
        if (_expiry < block.timestamp) revert Expired();
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function hashTypedDataV4(bytes32 calculatedHash) external view returns (bytes32) {
        return _hashTypedDataV4(calculatedHash);
    }

}