// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./Access.sol";

contract Officers is Access {

    using Strings for string;

    event RankUpdate (address officer, bytes32 indexed prevRank, bytes32 indexed newRank, uint indexed when, address from);
    event Onboard (address officer, bytes32 indexed newRank, uint indexed when, address from);
    event OffBoard (address officer, EmploymentStatus indexed employmentStatus, uint indexed when, address from);

    constructor(address _officer, string memory _name, string memory _badge) {
        _onboard(_officer, _name, _badge, CAPTAIN_ROLE);
    }

    struct Officer {
        string name;
        string badge;
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

    function isValidRank(address _officer, bytes32 _role) external view returns (bool) {
        return (hasRole(_role, _officer));
    }

    function isValidOfficer(address _officer) external view returns (bool) {
        return (officers[_officer].employmentStatus == EmploymentStatus.ACTIVE);
    }

    function onboard(address _officer, string memory _name, string memory _badge, bytes32 _rank) external onlyRole(CAPTAIN_ROLE) {
        _onboard(_officer, _name, _badge, _rank);
    }

    function _onboard(address _officer, string memory _name, string memory _badge, bytes32 _rank) internal {
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (_name.equal("") || _badge.equal("")) { revert InvalidString(); }
        if (_rank == DEFAULT_ADMIN_ROLE) { revert InvalidRank(); }
        
        Officer storage newOfficer = officers[_officer];
        newOfficer.name = _name;
        newOfficer.badge = _badge;
        newOfficer.employmentStatus = EmploymentStatus.ACTIVE;
        _grantRole(_rank, _officer);

        emit Onboard(_officer, _rank, block.timestamp, msg.sender);
    }

    function onboard(address _officer, bytes32 _rank) external onlyRole(CAPTAIN_ROLE) {
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (_rank == DEFAULT_ADMIN_ROLE) { revert InvalidRank(); }
        
        Officer storage newOfficer = officers[_officer];
        _grantRole(_rank, _officer);
        newOfficer.employmentStatus = EmploymentStatus.ACTIVE;

        emit Onboard(_officer, _rank, block.timestamp, msg.sender);
    }

    function offboard(address _officer, EmploymentStatus _employmentStatus, bytes32 rank) external onlyRole(CAPTAIN_ROLE) {
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (!hasRole(rank, _officer)) { revert InvalidOfficer(); }
        if (_employmentStatus == EmploymentStatus.ACTIVE) { revert InvalidStatus(); }
        
        Officer storage newOfficer = officers[_officer];
        newOfficer.employmentStatus = _employmentStatus;
        _revokeRole(rank, _officer);

        emit OffBoard(_officer, _employmentStatus, block.timestamp, msg.sender);
    }

    function updateRank(address _officer, bytes32 _prevRank, bytes32 _rank) external onlyRole(CAPTAIN_ROLE) {

        //call is valid rank
        if (_rank == _prevRank || _prevRank == DEFAULT_ADMIN_ROLE) { revert InvalidRank(); }
        if (!hasRole(_prevRank, _officer)) { revert InvalidOfficer(); }

        _revokeRole(_prevRank, _officer);
        _grantRole(_rank, _officer);

        emit RankUpdate(_officer, _prevRank, _rank, block.timestamp, msg.sender);
    }

}