// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./Utils/Error.sol";

contract Officers {

    using Strings for string;

    event RankUpdate (address officer, Rank indexed prevRank, Rank indexed newRank, uint indexed when, address from);
    event Onboard (address officer, Rank indexed newRank, uint indexed when, address from);
    event OffBoard (address officer, EmploymentStatus indexed employmentStatus, uint indexed when, address from);

    constructor(address _officer, string memory _name, string memory _badge) {
        _onboard(_officer, _name, _badge, Rank.CAPTAIN);
    }

    struct Officer {
        string name;
        string badge;
        EmploymentStatus employmentStatus;
        Rank rank;
    }

    enum Rank {
        NULL, OFFICER, DETECTIVE, CAPTAIN
    }

    enum EmploymentStatus {
        INACTIVE, ACTIVE, RETIRED, FIRED
    }

    modifier onlyRank(Rank rank) {
        if (officers[msg.sender].rank != rank) { revert InvalidRank(); }
        _;
    }

    mapping (address => Officer) officers;

    function officer(address _officer) external view returns (Officer memory) {
        return officers[_officer];
    }

    function isValidRank(address _officer, Rank _rank) public view returns (bool) {
        return (officers[_officer].rank == _rank);
    }

    function isValidOfficer(address _officer) external view returns (bool) {
        return (officers[_officer].employmentStatus == EmploymentStatus.ACTIVE);
    }

    function onboard(address _officer, string memory _name, string memory _badge, Rank _rank) external onlyRank(Rank.CAPTAIN) {
        _onboard(_officer, _name, _badge, _rank);
    }

    function _onboard(address _officer, string memory _name, string memory _badge, Rank _rank) internal {
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (_name.equal("") || _badge.equal("")) { revert InvalidString(); }
        
        Officer storage newOfficer = officers[_officer];
        newOfficer.name = _name;
        newOfficer.badge = _badge;
        newOfficer.employmentStatus = EmploymentStatus.ACTIVE;
        newOfficer.rank = _rank;

        emit Onboard(_officer, _rank, block.timestamp, msg.sender);
    }

    function onboard(address _officer, Rank _rank) external onlyRank(Rank.CAPTAIN) {
        if (_officer == address(0)) { revert InvalidAddress(); }
        
        Officer storage newOfficer = officers[_officer];
        newOfficer.rank = _rank;
        newOfficer.employmentStatus = EmploymentStatus.ACTIVE;

        emit Onboard(_officer, _rank, block.timestamp, msg.sender);
    }

    function offboard(address _officer, EmploymentStatus _employmentStatus, Rank _rank) external onlyRank(Rank.CAPTAIN) {
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (!isValidRank(_officer, _rank)) { revert InvalidOfficer(); }
        if (_employmentStatus == EmploymentStatus.ACTIVE) { revert InvalidStatus(); }
        
        Officer storage newOfficer = officers[_officer];
        newOfficer.employmentStatus = _employmentStatus;
        officers[_officer].rank = Rank.NULL;

        emit OffBoard(_officer, _employmentStatus, block.timestamp, msg.sender);
    }

    function updateRank(address _officer, Rank _prevRank, Rank _rank) external onlyRank(Rank.CAPTAIN) {

        //call is valid rank
        if (_rank == _prevRank) { revert InvalidRank(); }
        if (!isValidRank(_officer, _prevRank)) { revert InvalidOfficer(); }

        officers[_officer].rank = _rank;

        emit RankUpdate(_officer, _prevRank, _rank, block.timestamp, msg.sender);
    }

}