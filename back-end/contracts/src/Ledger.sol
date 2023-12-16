// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./Utils/Error.sol";
import "./Libraries/CreateBranch.sol";

contract Ledger is EIP712 {

    using Strings for string;

    event BranchUpdate(
        bytes32 indexed id,
        string precinctAddress,
        uint indexed jurisdictionArea
    );

    constructor(address _officer, string memory _name, bytes32 _badge, bytes32 _branchId) EIP712("Ledger", "1") {
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

    modifier onlyModerator(uint _code) {
        if (!moderators[msg.sender][_code]) { revert OnlyModerator(); }
        _;
    }

    mapping (address => Officer) public officers;
    mapping (address => mapping (uint => bool)) public moderators;
    mapping (uint => uint) public moderatorCount;
    mapping (bytes32 => Branch) public branches;
    
    // add a new branch
    function createBranch(
        string memory _id, 
        string memory _precinctAddress,
        uint _jurisdictionArea,
        bytes[] memory _signatures,
        address[] memory _signers
    ) external onlyModerator(_jurisdictionArea) {
        if(_id.equal("") || _precinctAddress.equal("") || _jurisdictionArea == 0) revert InvalidInput();

        bytes32 id = keccak256(abi.encode(_id));
        Branch storage _branch = branches[id];

        if(!_branch.precinctAddress.equal("")) revert BranchAlreadyExists();

        if(_signatures.length != _signers.length) revert LengthMismatch();
        if((moderatorCount[_jurisdictionArea] / 2) + 1  > _signers.length) revert NotEnoughSignatures();


        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            _precinctAddress,
            _jurisdictionArea,
            id
        ));

        _validateSignatures(messageHash, _signatures, _signers, _jurisdictionArea);

        _branch.precinctAddress = _precinctAddress;
        _branch.jurisdictionArea = _jurisdictionArea;

        emit BranchUpdate(
            id,
            _precinctAddress,
            _jurisdictionArea
        );

    }

    function _validateSignatures(
        bytes32 _hash,
        bytes[] memory _signatures,
        address[] memory _signers,
        uint _jurisdictionArea
    ) public view {
        bytes32 _messageHash = _hashTypedDataV4(_hash);
        for (uint i = 0; i < _signatures.length; ++i) {
            if(!(
                SignatureChecker.isValidSignatureNow(_signers[i], _messageHash, _signatures[i]) && moderators[_signers[i]][_jurisdictionArea]
            )) revert InvalidSignature();
        }   
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32 domainSeparator) {
        domainSeparator = _domainSeparatorV4();
    }

}