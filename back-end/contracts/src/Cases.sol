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
 * @dev This contract is designed to work in conjunction with the Access and Ledger contracts.
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

    event ParticipantApproved(uint48 participantId);

    event EvidenceApproved(uint48 evidenceId);
    
    enum CaseStatus {
        NULL, OPEN, CLOSED, COLD
    }

    struct Case {
        CaseStatus status;
        bytes32 branch;
        mapping (address => bool) officers;
        mapping (uint48 => Participants.Participant) participants;
        mapping (uint48 => Evidences.Evidence) evidences;
    }

    constructor(address _ledgersContract) EIP712("Cases", "1") {
        ledgersContract = Ledger(_ledgersContract);
    }

    mapping (uint => Case) _case;

    /// @dev trustee address => case Id => T/F
    mapping (address => mapping (uint => bool)) trusteeLedger;

    /// @dev saves executed transactions to protect against replay
    mapping (bytes32 => bool) public replay;

    modifier onlyRank(Ledger.Rank rank) {
        _onlyRank(rank);
        _;
    }

    function _onlyRank(Ledger.Rank rank) internal view {
        if (ledgersContract.isValidRank(msg.sender, rank)) { revert InvalidRank(); }
    }

    /**
     * @notice Creates a new legal case.
     * @param _caseId The unique identifier for the new case.
     * @dev The caller must have the 'CAPTAIN' role to create a case.
     */
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

    /**
     * @notice Updates the status of a case.
     * @param _caseId The identifier of the case to be updated.
     * @param _status The new status of the case.
     * @dev The caller must have the 'CAPTAIN' role for the specified case.
     */
    function updateCaseStatus(uint _caseId, CaseStatus _status) external onlyRank(Ledger.Rank.CAPTAIN) {
        Case storage newCase = _case[_caseId];

        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(!newCase.officers[msg.sender]) { revert InvalidOfficer(); }

        CaseStatus oldStatus = newCase.status;
        newCase.status = _status;

        emit CaseUpdated(_caseId, msg.sender, newCase.branch, oldStatus, _status);
    }

    /**
     * @notice Adds an officer to a case.
     * @param _caseId The identifier of the case to which an officer is added.
     * @param _officer The address of the officer to be added.
     * @dev The caller must have the 'CAPTAIN' role for the specified case.
     */
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

    /**
     * @notice transfers the assigned captain of case.
     * @param params TransferCaptain params
     * @dev The caller must have the 'Moderator' role for the specified case.
     */
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

    /**
     * @notice Removes an officer from a case.
     * @param _caseId The identifier of the case from which an officer is removed.
     * @param _officer The address of the officer to be removed.
     * @dev The caller must have the 'CAPTAIN' role for the specified case, and the officer must be assigned to the case.
     */
    function removeOfficerInCase(uint _caseId, address _officer) external onlyRank(Ledger.Rank.CAPTAIN) {

        Case storage newCase = _case[_caseId];
        
        if(!newCase.officers[_officer]) { revert InvalidOfficer(); } //check if officer is assigned this case
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }

        delete(newCase.officers[_officer]);

        emit RemoveOfficer(_caseId, msg.sender, _officer);
    }

    /**
     * @notice Adds a participant to a case.
     * @param _caseId The identifier of the case to which the participant is added.
     * @param _participant The participant's data and signature.
     * @dev The caller must be an officer assigned to the specified case.
     */
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

    /**
     * @notice Adds evidence to a case.
     * @param _caseId The identifier of the case to which evidence is added.
     * @param _evidence The evidence's data and signature.
     * @dev The caller must be an officer assigned to the specified case.
     */
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
    
    function addEvidence(
        uint _caseId, 
        Evidences.Evidence memory _evidence
    ) external {

        Case storage newCase = _case[_caseId];

        (
            ,,,
            bytes32 fromBranchId, 
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

    function revokeTrusteeAccess(address _trustee, uint _caseId, bytes32 _branchId) external onlyRank(Ledger.Rank.CAPTAIN) {
        
        if(address(0) == _trustee) { revert InvalidAddress(); }

        Case storage currCase = _case[_caseId];
        if(currCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(!trusteeLedger[_trustee][_caseId]) { revert NoAccessToRevoke(); }

        trusteeLedger[_trustee][_caseId] = false;
        
        emit Trustee(_caseId, _branchId, msg.sender, _trustee, false);
    }

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

    function _getHash(
        bytes memory _data
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(_data));
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function hashTypedDataV4(bytes32 calculatedHash) external view returns (bytes32) {
        return _hashTypedDataV4(calculatedHash);
    }

}