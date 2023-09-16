// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./Access.sol";

contract Officers is Access {

    using Strings for string;

    event Promotion (address officer, Rank indexed prevRank, Rank indexed newRank, uint indexed when, address from);
    event NewOfficer (address officer, Rank indexed newRank, uint indexed when, address from);

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

    function onboard(address _officer, string memory name, string memory badge, Rank rank) external onlyRole(CAPTAIN_ROLE) {
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (name.equal("") || badge.equal("")) { revert InvalidString(); }
        
        Officer storage newOfficer = officers[_officer];
        newOfficer.name = name;
        newOfficer.badge = badge;
        newOfficer.rank = rank;
        newOfficer.employmentStatus = EmploymentStatus.ACTIVE;

        emit NewOfficer(_officer, rank, block.timestamp, msg.sender);
    }

}

/** I can ...
 * add a new officer
 * deactivate an officer
 * 
 */