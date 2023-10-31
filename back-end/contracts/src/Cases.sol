// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./Access.sol";
import "./Officers.sol";

/**
 * @title Cases
 * @notice A smart contract for managing and tracking legal cases.
 * This contract provides functionality for creating and updating cases, managing officers, adding participants and evidence to cases,
 * and verifying the integrity of data through signatures and data hashing.
 * @dev This contract is designed to work in conjunction with the Access and Officers contracts.
 */
contract Cases is EIP712 {

    using Strings for string;

    Officers officersContract;
    
    /**
     * @dev Emitted when a case is created or updated.
     * @dev `caseId` The identifier of the case being updated.
     * @dev `initiator` The address of the officer initiating the status update.
     * @dev `oldStatus` The previous status of the case.
     * @dev `newStatus` The new status of the case.
     */
    event CaseUpdated(uint caseId, address indexed initiator, CaseStatus oldStatus, CaseStatus newStatus);
    
    /**
     * @dev Emitted when an officer is added to or removed from a case.
     * @dev `caseId` The identifier of the case to which an officer is added.
     * @dev `initiator` The address of the officer initiating the addition.
     * @dev `officer` The address of the officer being added.
     * @dev `caseSpecificOfficerId` The unique identifier for the officer within the case.
     */
    event UpdateOfficerInCase(uint caseId, address indexed initiator, address indexed officer, uint256 caseSpecificOfficerId);

    /**
     * @dev Emitted when an officer is removed from a case.
     * @dev `caseId` The identifier of the case from which an officer is removed.
     * @dev `initiator` The address of the officer initiating the removal.
     * @dev `officer` The address of the officer being removed.
     * @dev `caseSpecificOfficerId` The unique identifier for the officer within the case.
     */
    event RemoveOfficer(uint caseId, address indexed initiator, address indexed officer, uint256 caseSpecificOfficerId);

    /**
     * @dev Emitted when a new participant is added to a case.
     * @dev `caseId` The identifier of the case to which the participant is added.
     * @dev `initiator` The address of the officer initiating the addition.
     * @dev `suspectId` The unique identifier for the participant in the case.
     * @dev `category` The category of the participant (e.g., SUSPECT, WITNESS, PERPETRATOR, VICTIM).
     * @dev `dataHash` The hash of the participant's data for data integrity verification.
     * @dev `data` The data associated with the participant.
     */
    event NewParticipantInCase(uint caseId, address indexed initiator, uint48 suspectId, ParticipantCategory category, bytes32 dataHash, bytes data);
    
    /**
     * @dev Emitted when new evidence is added to a case.
     * @dev `caseId` The identifier of the case to which evidence is added.
     * @dev `initiator` The address of the officer initiating the addition.
     * @dev `evidenceId` The unique identifier for the evidence in the case.
     * @dev `category` The category of the evidence (e.g., WEAPON, PHYSICAL, DRUG, DOCUMENTARY, etc.).
     * @dev `dataHash` The hash of the evidence's data for data integrity verification.
     * @dev `data` The data associated with the evidence.
     */
    event NewEvidenceInCase(uint caseId, address indexed initiator, uint48 evidenceId, EvidenceCategory category, bytes32 dataHash, bytes data);
    
    enum CaseStatus {
        NULL, OPEN, CLOSED, COLD
    }

    enum ParticipantCategory {
        SUSPECT, WITNESS, PERPETRATOR, VICTIM
    }
    
    enum EvidenceCategory {
        WEAPON, PHYSICAL, DRUG, DOCUMENTARY, DEMONSTRATIVE, HEARSAY, MURDER_WEAPON
    }

    struct Participant {
        uint48 suspectId;
        ParticipantCategory category;
        bytes data;
        bytes signature;
    }

    struct Evidence {
        uint48 evidenceId;
        EvidenceCategory category;
        bytes data;
        bytes signature;
    }

    struct Case {
        CaseStatus status;
        address[] officers;
        Participant[] participants;
        Evidence[] evidences;   
    }

    constructor(address _officersContract) EIP712("Cases", "1") {
        officersContract = Officers(_officersContract);
    }

    mapping (uint => Case) _case;

    modifier onlyRole(bytes32 role) {
        _onlyRole(role);
        _;
    }

    function _onlyRole(bytes32 role) internal view {
        require(officersContract.hasRole(role, msg.sender));
    }

    /**
     * @notice Creates a new legal case.
     * @param _caseId The unique identifier for the new case.
     * @dev The caller must have the 'CAPTAIN' role to create a case.
     */
    function addCase(uint _caseId) external onlyRole(officersContract.CAPTAIN_ROLE()) {

        if(_case[_caseId].status != CaseStatus.NULL) { revert InvalidCase(); }

        Case storage newCase = _case[_caseId];
        newCase.status = CaseStatus.OPEN;
        newCase.officers.push(msg.sender); //case.officers[0] is always the captain

        emit CaseUpdated(_caseId, msg.sender, CaseStatus.NULL, CaseStatus.OPEN);
    }

    /**
     * @notice Updates the status of a case.
     * @param _caseId The identifier of the case to be updated.
     * @param _status The new status of the case.
     * @dev The caller must have the 'CAPTAIN' role for the specified case.
     */
    function updateCaseStatus(uint _caseId, CaseStatus _status) external onlyRole(officersContract.CAPTAIN_ROLE()) {
        Case storage newCase = _case[_caseId];

        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(newCase.officers[0] != msg.sender) { revert InvalidOfficer(); }

        CaseStatus oldStatus = newCase.status;
        newCase.status = _status;

        emit CaseUpdated(_caseId, msg.sender, oldStatus, _status);
    }

    /**
     * @notice Adds an officer to a case.
     * @param _caseId The identifier of the case to which an officer is added.
     * @param _officer The address of the officer to be added.
     * @dev The caller must have the 'CAPTAIN' role for the specified case.
     */
    function addOfficerInCase(uint _caseId, address _officer) external onlyRole(officersContract.CAPTAIN_ROLE()) {

        Case storage newCase = _case[_caseId];
        
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(newCase.officers[0] != msg.sender) { revert InvalidOfficer(); }
        if(officersContract.hasRole(officersContract.CAPTAIN_ROLE(), _officer)) { revert InvalidRank(); }

        newCase.officers.push(_officer); 

        emit UpdateOfficerInCase(_caseId, msg.sender, _officer, newCase.officers.length - 1);
    }

    /**
     * @notice transfers the assigned captain of case.
     * @param _caseId The identifier of the case to which an officer is added.
     * @param _officer The address of the officer to be added.
     * @dev The caller must have the 'CAPTAIN' role for the specified case.
     */
    function transferCaseCaptain(uint _caseId, address _officer) external onlyRole(officersContract.CAPTAIN_ROLE()) {

        Case storage newCase = _case[_caseId];
        
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(newCase.officers[0] != msg.sender) { revert InvalidOfficer(); }
        if(!officersContract.hasRole(officersContract.CAPTAIN_ROLE(), _officer)) { revert InvalidRank(); }

        newCase.officers[0] = _officer;

        emit UpdateOfficerInCase(_caseId, msg.sender, _officer, 0);
    }

    /**
     * @notice Removes an officer from a case.
     * @param _caseId The identifier of the case from which an officer is removed.
     * @param _caseSpecificOfficerId The index of the officer within the case.
     * @param _officer The address of the officer to be removed.
     * @dev The caller must have the 'CAPTAIN' role for the specified case, and the officer must be assigned to the case.
     */
    function removeOfficerInCase(uint _caseId, uint256 _caseSpecificOfficerId, address _officer) external onlyRole(officersContract.CAPTAIN_ROLE()) {

        Case storage newCase = _case[_caseId];
        
        if(newCase.officers[_caseSpecificOfficerId] != msg.sender) { revert InvalidOfficer(); } //check if officer is assigned this case
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }

        delete(newCase.officers[_caseSpecificOfficerId]);

        emit RemoveOfficer(_caseId, msg.sender, _officer, _caseSpecificOfficerId);
    }

    /**
     * @notice Adds a participant to a case.
     * @param _caseId The identifier of the case to which the participant is added.
     * @param _caseSpecificOfficerId The index of the officer within the case.
     * @param _participant The participant's data and signature.
     * @param _dataHash The hash of the participant's data for data integrity verification.
     * @dev The caller must be an officer assigned to the specified case.
     */
    function addParticipant(uint _caseId, uint256 _caseSpecificOfficerId, Participant memory _participant, bytes32 _dataHash) external {

        Case storage newCase = _case[_caseId];

        if(newCase.officers[_caseSpecificOfficerId] != msg.sender) { revert InvalidOfficer(); } //check if officer is assigned this case
        
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }

        bytes32 calculatedHash = _hashTypedDataV4(_getHash(_participant.data));

        if (_dataHash != calculatedHash) { revert InvalidHash(); }

        _validateSignature(_participant.signature, calculatedHash);

        newCase.participants.push(_participant);

        emit NewParticipantInCase(_caseId, msg.sender, _participant.suspectId, _participant.category, calculatedHash, _participant.data);
    }

    /**
     * @notice Adds evidence to a case.
     * @param _caseId The identifier of the case to which evidence is added.
     * @param _caseSpecificOfficerId The index of the officer within the case.
     * @param _evidence The evidence's data and signature.
     * @param _dataHash The hash of the evidence's data for data integrity verification.
     * @dev The caller must be an officer assigned to the specified case.
     */
    function addEvidence(uint _caseId, uint256 _caseSpecificOfficerId, Evidence memory _evidence, bytes32 _dataHash) external {

        Case storage newCase = _case[_caseId];

        if(newCase.officers[_caseSpecificOfficerId] != msg.sender) { revert InvalidOfficer(); } //check if officer is assigned this case
        
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }

        bytes32 calculatedHash = _hashTypedDataV4(_getHash(_evidence.data));

        if (_dataHash != calculatedHash) { revert InvalidHash(); }

        _validateSignature(_evidence.signature, calculatedHash);

       newCase.evidences.push(_evidence);

        emit NewEvidenceInCase(_caseId, msg.sender, _evidence.evidenceId, _evidence.category, calculatedHash, _evidence.data);
    }

    function _validateSignature(bytes memory _signature, bytes32 _hash) internal view {
        if (ECDSA.recover(_hash, _signature) == msg.sender) { revert InvalidSignature(); }
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


/** Only the ... 
 * captain can open a case
 * captain can re-activate the case
 * captain can close a case
 */

/** I can get information about
 * the case id
 * the precinct the case assigned to
 * the officers the case assigned to
 * the case status
 */

/** how to store information inside a case?
 * log info in events
 * save in contract
 */

/** TODO ...
 * build a pattern for case id's like there is for cnics
 */