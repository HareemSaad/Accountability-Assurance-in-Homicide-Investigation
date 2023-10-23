// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./Access.sol";
import "./Officers.sol";

contract Cases is EIP712 {

    using Strings for string;

    Officers officersContract;

    event NewCase(uint caseId, address indexed initiator);
    event CaseStatusUpdated(uint caseId, address indexed initiator, CaseStatus oldStatus, CaseStatus newStatus);
    event AddOfficer(uint caseId, address indexed initiator, address indexed officer, uint256 _caseSpecificOfficerId);
    event RemoveOfficer(uint caseId, address indexed initiator, address indexed officer, uint256 _caseSpecificOfficerId);
    event NewParticipantInCase(uint caseId, address indexed initiator, uint48 suspectId, ParticipantCategory category, bytes32 dataHash, bytes data);
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

    function addCase(uint _caseId) external onlyRole(officersContract.CAPTAIN_ROLE()) {

        if(_case[_caseId].status != CaseStatus.NULL) { revert InvalidCase(); }

        Case storage newCase = _case[_caseId];
        newCase.status = CaseStatus.OPEN;
        newCase.officers.push(msg.sender); //case.officers[0] is always the captain

        emit NewCase(_caseId, msg.sender);
    }

    function updateCaseStatus(uint _caseId, CaseStatus _status) external onlyRole(officersContract.CAPTAIN_ROLE()) {
        Case storage newCase = _case[_caseId];

        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(newCase.officers[0] != msg.sender) { revert InvalidOfficer(); }

        CaseStatus oldStatus = newCase.status;
        newCase.status = _status;

        emit CaseStatusUpdated(_caseId, msg.sender, oldStatus, _status);
    }

    function addOfficerInCase(uint _caseId, address _officer) external onlyRole(officersContract.CAPTAIN_ROLE()) {

        Case storage newCase = _case[_caseId];
        
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }
        if(newCase.officers[0] != msg.sender) { revert InvalidOfficer(); }

       newCase.officers.push(_officer); 

        emit AddOfficer(_caseId, msg.sender, _officer, newCase.officers.length - 1);
    }

    function removeOfficerInCase(uint _caseId, uint256 _caseSpecificOfficerId, address _officer) external onlyRole(officersContract.CAPTAIN_ROLE()) {

        Case storage newCase = _case[_caseId];
        
        if(newCase.officers[_caseSpecificOfficerId] != msg.sender) { revert InvalidOfficer(); } //check if officer is assigned this case
        if(newCase.status == CaseStatus.NULL) { revert InvalidCase(); }

        delete(newCase.officers[_caseSpecificOfficerId]);

        emit RemoveOfficer(_caseId, msg.sender, _officer, _caseSpecificOfficerId);
    }

    /**
     * @dev add a modifier or something
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
     * @dev add a modifier or something
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