// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./Access.sol";
import "./Officers.sol";

contract Cases is Access, EIP712 {

    using Strings for string;

    Officers officersContract;

    event NewCase(uint caseId, address indexed initiator);
    event CaseStatusUpdated(uint caseId, address indexed initiator, CaseStatus oldStatus, CaseStatus newStatus);
    event AddOfficer(uint caseId, address indexed initiator, address indexed officer);
    event NewParticipantInCase(uint caseId, address indexed initiator, uint48 suspectId, ParticipantCategory category, bytes32 data);
    event NewEvidenceInCase(uint caseId, address indexed initiator, uint48 evidenceId, EvidenceCategory category, bytes32 data);
    
    enum CaseStatus {
        OPEN, CLOSED, COLD
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

    function addCase(uint _caseId) external onlyRole(CAPTAIN_ROLE) {

        Case storage newCase = _case[_caseId];
        newCase.status = CaseStatus.OPEN;

        emit NewCase(_caseId, msg.sender);
    }

    function updateCaseStatus(uint _caseId, CaseStatus _status) external onlyRole(CAPTAIN_ROLE) {

        CaseStatus oldStatus = _case[_caseId].status;
        _case[_caseId].status = _status;

        emit CaseStatusUpdated(_caseId, msg.sender, oldStatus, _status);
    }

    function addOfficerInCase(uint _caseId, address _officer) external onlyRole(CAPTAIN_ROLE) {

        if(officersContract.isValidOfficer(_officer)) { revert InvalidOfficer(); }

        _case[_caseId].officers.push(_officer); 

        emit AddOfficer(_caseId, msg.sender, _officer);
    }

    /**
     * @dev add a modifier or something
     */
    function addParticipant(uint _caseId, Participant memory _participant, bytes32 _dataHash) external {

        bytes32 calculatedHash = _getHash(_participant.data);

        if (_dataHash != calculatedHash) { revert InvalidHash(); }

        _validateSignature(_participant.signature, _hashTypedDataV4(calculatedHash));

        _case[_caseId].participants.push(_participant);

        emit NewParticipantInCase(_caseId, msg.sender, _participant.suspectId, _participant.category, calculatedHash);
    }

    /**
     * @dev add a modifier or something
     */
    function addEvidence(uint _caseId, Evidence memory _evidence, bytes32 _dataHash) external {

        bytes32 calculatedHash = _getHash(_evidence.data);

        if (_dataHash != calculatedHash) { revert InvalidHash(); }

        _validateSignature(_evidence.signature, _hashTypedDataV4(calculatedHash));

        _case[_caseId].evidences.push(_evidence);

        emit NewEvidenceInCase(_caseId, msg.sender, _evidence.evidenceId, _evidence.category, calculatedHash);
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