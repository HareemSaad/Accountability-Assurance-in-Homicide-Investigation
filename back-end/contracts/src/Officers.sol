// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./Utils/Error.sol";

contract Officers {

    using Strings for string;

    event OfficerStatusChange (
        address officer, 
        bytes32 indexed branchId, 
        Rank indexed newRank, 
        EmploymentStatus indexed employmentStatus,
        uint when, 
        address from
    );

    constructor(address _officer, string memory _name, bytes32 _badge, bytes32 _branchId) {
        _onboard(_officer, _name, _badge, _branchId, Rank.MODERATOR);
    }

    struct Officer {
        string name;
        bytes32 badge;
        bytes32 branchId;
        EmploymentStatus employmentStatus;
        Rank rank;
    }

    enum Rank {
        NULL, OFFICER, DETECTIVE, CAPTAIN, MODERATOR
    }

    enum EmploymentStatus {
        INACTIVE, ACTIVE, RETIRED, FIRED
    }

    modifier onlyRank(Rank rank) {
        if (officers[msg.sender].rank != rank) { revert InvalidRank(); }
        _;
    }

    mapping (address => Officer) officers;
    mapping (bytes32 => address) branches;

    function officer(address _officer) external view returns (Officer memory) {
        return officers[_officer];
    }

    function isValidRank(address _officer, Rank _rank) public view returns (bool) {
        return (officers[_officer].rank == _rank);
    }

    function isValidOfficer(address _officer) external view returns (bool) {
        return (officers[_officer].employmentStatus == EmploymentStatus.ACTIVE);
    }

    function onboard(
        address _officer, 
        string memory _name, 
        bytes32 _badge, 
        bytes32 _branchId, 
        Rank _rank
    ) external onlyRank(Rank.CAPTAIN) {
        // captain cannot hire another captain or moderator
        if (_rank == Rank.CAPTAIN || _rank == Rank.MODERATOR) { revert InvalidRank(); }
        _onboard(_officer, _name, _badge, _branchId, _rank);
    }

    function onboardCaptain(
        address _officer, 
        string memory _name, 
        bytes32 _badge, 
        bytes32 _branchId, 
        Rank _rank
    ) external onlyRank(Rank.MODERATOR) {
        // moderator cannot hire officers or detectives
        if (_rank == Rank.OFFICER || _rank == Rank.DETECTIVE) { revert InvalidRank(); }
        _onboard(_officer, _name, _badge, _branchId, _rank);
    }

    function _onboard(
        address _officer, 
        string memory _name, 
        bytes32 _badge, 
        bytes32 _branchId, 
        Rank _rank
    ) internal {
        
        // sanity checks
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (_name.equal("")) { revert InvalidString(); }
        if (_badge == keccak256(abi.encode(""))) { revert InvalidBadge(); }
        if (_branchId == keccak256(abi.encode(""))) { revert InvalidBranch(); }
        if (_rank == Rank.NULL) { revert InvalidRank(); }
        if (branches[_branchId] != address(0)) { revert PreexistingBranch(); }

        // if captain is being onboarded he needs to be assigned to a branch
        if (_rank == Rank.CAPTAIN) { branches[_branchId] = _officer; }
        
        // create officer
        Officer storage newOfficer = officers[_officer];
        newOfficer.name = _name;
        newOfficer.badge = _badge;
        newOfficer.employmentStatus = EmploymentStatus.ACTIVE;
        newOfficer.rank = _rank;

        emit OfficerStatusChange(_officer, _branchId, _rank, EmploymentStatus.ACTIVE, block.timestamp, msg.sender);
    }

    function onboard(address _officer, bytes32 _branchId, Rank _rank) external onlyRank(Rank.CAPTAIN) {
        Officer storage newOfficer = officers[_officer];
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (newOfficer.badge == keccak256(abi.encode(""))) { revert InvalidOfficer(); }
        
        newOfficer.rank = _rank;
        newOfficer.employmentStatus = EmploymentStatus.ACTIVE;
        newOfficer.branchId = _branchId;

        emit OfficerStatusChange(_officer, _branchId, _rank, EmploymentStatus.ACTIVE, block.timestamp, msg.sender);
    }

    function offboard(
        address _officer, 
        bytes32 _branchId, 
        EmploymentStatus _employmentStatus, 
        Rank _rank
    ) external onlyRank(Rank.CAPTAIN) {
        //captain cannot offboard another aptain or moderator
        if (_rank == Rank.CAPTAIN || _rank == Rank.MODERATOR) { revert InvalidRank(); }
        _offboard(_officer, _branchId, _employmentStatus, _rank);
    }

    function offboardCaptain(
        address _officer, 
        bytes32 _branchId, 
        EmploymentStatus _employmentStatus, 
        Rank _rank
    ) external onlyRank(Rank.MODERATOR) {
        _offboard(_officer, _branchId, _employmentStatus, _rank);
    }

    function _offboard(
        address _officer, 
        bytes32 _branchId, 
        EmploymentStatus _employmentStatus, 
        Rank _rank
    ) internal onlyRank(Rank.CAPTAIN) {
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (!isValidRank(_officer, _rank)) { revert InvalidOfficer(); }
        if (_employmentStatus == EmploymentStatus.ACTIVE) { revert InvalidStatus(); }
        if (branches[_branchId] == address(0)) { revert NonexistingBranch(); }

        // if captain is being offboarded he needs to be de-assigned from thier branch
        if (_rank == Rank.CAPTAIN) { branches[_branchId] = address(0); }
        
        Officer storage newOfficer = officers[_officer];
        newOfficer.employmentStatus = _employmentStatus;
        officers[_officer].rank = Rank.NULL;

        emit OfficerStatusChange(_officer, _branchId, _rank, _employmentStatus, block.timestamp, msg.sender);
    }

    function updateRank(
        address _officer,
        bytes32 _branchId,  
        Rank _prevRank, 
        Rank _rank
    ) external onlyRank(Rank.CAPTAIN) {

        if (_rank == Rank.NULL) { revert InvalidRank(); }
        //call is valid rank
        if (_rank == _prevRank) { revert InvalidRank(); }
        if (!isValidRank(_officer, _prevRank)) { revert InvalidOfficer(); }

        officers[_officer].rank = _rank;

        emit OfficerStatusChange(_officer, _branchId, _rank, EmploymentStatus.ACTIVE, block.timestamp, msg.sender);
    }

}