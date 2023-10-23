// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./Access.sol";

contract Officers is Access {

    using Strings for string;

    event RankUpdate (address officer, Rank indexed prevRank, Rank indexed newRank, uint indexed when, address from);
    event NewOfficer (address officer, Rank indexed newRank, uint indexed when, address from);
    event OffBoard (address officer, EmploymentStatus indexed employmentStatus, uint indexed when, address from);

    struct Officer {
        string name;
        string badge;
        Rank rank;
        EmploymentStatus employmentStatus;
    }

    enum Rank {
        NULL, OFFICER, DETECTIVE, CAPTAIN
    }

    enum EmploymentStatus {
        INACTIVE, ACTIVE, RETIRED, FIRED
    }

    mapping (address => Officer) officers;

    function officer(address _officer) external view returns (Officer memory) {
        return officers[_officer];
    }

    function isValidRank(address _officer, Rank _rank) external view returns (bool) {
        return (officers[_officer].rank == _rank);
    }

    function isValidOfficer(address _officer) external view returns (bool) {
        return !(officers[_officer].rank == Rank.NULL);
    }

    function onboard(address _officer, string memory name, string memory badge, Rank rank) external onlyRole(CAPTAIN_ROLE) {
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (name.equal("") || badge.equal("")) { revert InvalidString(); }
        if (rank == Rank.NULL) { revert InvalidRank(); }
        
        Officer storage newOfficer = officers[_officer];
        newOfficer.name = name;
        newOfficer.badge = badge;
        newOfficer.rank = rank;
        newOfficer.employmentStatus = EmploymentStatus.ACTIVE;

        emit NewOfficer(_officer, rank, block.timestamp, msg.sender);
    }

    function onboard(address _officer, Rank rank) external onlyRole(CAPTAIN_ROLE) {
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (rank == Rank.NULL) { revert InvalidRank(); }
        
        Officer storage newOfficer = officers[_officer];
        newOfficer.rank = rank;
        newOfficer.employmentStatus = EmploymentStatus.ACTIVE;

        emit NewOfficer(_officer, rank, block.timestamp, msg.sender);
    }

    function offboard(address _officer, EmploymentStatus employmentStatus) external onlyRole(CAPTAIN_ROLE) {
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (employmentStatus == EmploymentStatus.ACTIVE) { revert InvalidStatus(); }
        
        Officer storage newOfficer = officers[_officer];
        newOfficer.employmentStatus = employmentStatus;

        emit OffBoard(_officer, employmentStatus, block.timestamp, msg.sender);
    }

    function updateRank(address _officer, Rank rank) external onlyRole(CAPTAIN_ROLE) {
        Rank prevRank = officers[_officer].rank;

        //call is valid rank
        if (officers[_officer].rank != prevRank) { revert InvalidOfficer(); }
        if (rank == prevRank) { revert InvalidRank(); }

        officers[_officer].rank = rank;

        emit RankUpdate(_officer, prevRank, rank, block.timestamp, msg.sender);
    }

}