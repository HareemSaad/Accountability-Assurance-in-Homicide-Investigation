// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";

contract Officers {

    using Strings for string;

    event Promotion (address officer, Rank indexed prevRank, Rank indexed newRank, uint indexed when, address from);

    struct Officer {
        string name;
        string badge;
        Rank rank;
        EmploymentStatus employmentStatus;
    }

    enum Rank {
        OFFICER, DETECTIVE, CAPTAIN
    }

    enum EmploymentStatus {
        ACTIVE, RETIRED, INACTIVE
    }

    mapping (address => Officer) officers;

    function officer(address _officer) external view returns (Officer memory) {
        return officers[_officer];
    }

    function isValidOfficer(address _officer) external view returns (bool) {
        return officers[_officer].badge.equal("");
    }

}

/** I can ...
 * add a new officer
 * deactivate an officer
 * 
 */