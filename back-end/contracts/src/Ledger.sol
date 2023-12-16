// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./Utils/Error.sol";

contract Ledger {

    using Strings for string;

    event BranchUpdate(

    );

    constructor(address _officer, string memory _name, bytes32 _badge, bytes32 _branchId) {
        // _onboard(_officer, _name, _badge, _branchId, Rank.MODERATOR);
    }

    struct Officer {
        string name;
        string legalNumber;
        bytes32 badge;
        bytes32 branchId;
        EmploymentStatus employmentStatus;
        Rank rank;
    }

    struct Branch {
        string precinctAddress;
        uint jurisdictionArea; //postal code
        uint numberOfOfficers;
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

    mapping (address => Officer) public officers;
    mapping (bytes32 => Branch) public branches;
    
    // add a new branch
    function createBranch(
        string memory _id, 
        string memory _precinctAddress,
        uint _jurisdictionArea
    ) external onlyRank(Rank.MODERATOR) {
        if(_id.equal("") || _precinctAddress.equal("") || _jurisdictionArea == 0) revert InvalidId();

        Branch storage _branch = branches[keccak256(abi.encode(_id))];

        if(!_branch.precinctAddress.equal("")) revert BranchAlreadyExists();

        _branch.precinctAddress = _precinctAddress;
        _branch.jurisdictionArea = _jurisdictionArea;

    }

}