// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./Access.sol";
import "./Officers.sol";

contract Cases is Access {

    using Strings for string;

    Officers officersContract;

    event NewCase(uint caseId, address indexed initiator);
    event CaseStatusUpdated(uint caseId, address indexed initiator, CaseStatus oldStatus, CaseStatus newStatus);
    event AddOfficer(uint caseId, address indexed initiator, address indexed officer);
    
    enum CaseStatus {
        OPEN, CLOSED, COLD
    }

    enum ParticipantCategory {
        SUSPECT, WITNESS, PERPETRATOR, VICTIM
    }
    
    enum EvidenceCategory {
        WEAPON, PHYSICAL, DRUG, DOCUMENTARY, DEMONSTRATIVE, HEARSAY, MURDER_WEAPON
    }

    struct Figure {
        uint48 suspectId;
        ParticipantCategory category;
        bytes data;
        bytes32 signature;
    }

    struct Evidence {
        uint48 evidenceId;
        EvidenceCategory category;
        bytes data;
        bytes32 signature;
    }

    struct Case {
        CaseStatus status;
        address[] officers;
        Figure[] figures;
        Evidence[] evidences;   
    }

    constructor(address _officersContract) {
        officersContract = Officers(_officersContract);
    }

    mapping (uint => Case) _case;

    function addCase(uint _caseId, Figure[] calldata _figures) external onlyRole(CAPTAIN_ROLE) {

        Case storage newCase = _case[_caseId];
        newCase.status = CaseStatus.OPEN;
        newCase.figures = _figures;

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

    // function addFigure(uint _caseId, Figure _figure) external onlyRole(CAPTAIN_ROLE) {

    //     _case[_caseId].figures.push(_figure);

    //     emit NewFigureInCase(_caseId, msg.sender, _figure.);
    // }

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