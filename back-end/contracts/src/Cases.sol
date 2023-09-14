// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Cases {

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
        Figure[] figures;
        Evidence[] evidences;   
    }

    mapping (uint => Case) _case;

}

/** I can ...
 * add a new case
 * close an opened case
 * periodically call the contract to dormant inactive cases
 * add suspects in a case
 * add evidence in a case
 * add witnesses in a case
 * add alibis in a case...?
 * add victim in a case
 * add murder weapon in a case
 * add culprit in a case
 */

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