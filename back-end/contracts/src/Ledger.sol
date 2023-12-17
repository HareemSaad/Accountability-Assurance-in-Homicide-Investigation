// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./Utils/Error.sol";
import "./Libraries/CreateBranch.sol";
import "./Libraries/UpdateBranch.sol";
import "./Libraries/Onboard.sol";
import "forge-std/Test.sol";

contract Ledger is EIP712 {

    using Strings for string;

    event BranchUpdate(
        bytes32 indexed id,
        string precinctAddress,
        uint indexed jurisdictionArea,
        uint indexed stateCode
    );

    event Onboard (
        address indexed officer, 
        string name, 
        bytes32 legalNumber, 
        bytes32 badge, 
        bytes32 indexed branchId, 
        Rank indexed rank, 
        uint when, 
        address from
    );

    constructor(
        bytes32 _branchId, 
        string memory _precinctAddress,
        uint _jurisdictionArea,
        uint _stateCode,
        address _officer, 
        string memory _name, 
        bytes32 _legalNumber, 
        bytes32 _badge, 
        Rank _rank
    
    ) EIP712("Ledger", "1") {

        //create a branch
        _initializeBranch(
            _branchId, 
            _precinctAddress,
            _jurisdictionArea,
            _stateCode
        );

        //create a moderator
        _addOfficer(
            _stateCode,
            _officer, 
            _name, 
            _legalNumber, 
            _badge, 
            _branchId, 
            _rank
        );
    }

    struct Officer {
        string name;
        bytes32 legalNumber;
        bytes32 badge;
        bytes32 branchId;
        EmploymentStatus employmentStatus;
        Rank rank;
    }

    struct Branch {
        string precinctAddress;
        uint jurisdictionArea; //postal code
        uint stateCode;
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
    mapping (bytes32 => bool) public replay;

    function isValidBranch(bytes32 id) public view returns (bool) {
        return (branches[id].stateCode != 0);
    }

    function isValidState(uint stateCode) public view returns (bool) {
        return (moderatorCount[stateCode] != 0);
    }

    // add a new branch
    function createBranch(
        string memory _id, 
        string memory _precinctAddress,
        uint _jurisdictionArea,
        uint _stateCode,
        uint _nonce,
        bytes[] memory _signatures,
        address[] memory _signers
    ) external onlyModerator(_stateCode) {
        if(_id.equal("") || _precinctAddress.equal("") || _jurisdictionArea == 0 || _stateCode == 0) revert InvalidInput();

        bytes32 id = keccak256(abi.encode(_id));

        if(_signatures.length != _signers.length) revert LengthMismatch();
        if((moderatorCount[_stateCode] / 2) + 1  > _signers.length) revert NotEnoughSignatures();


        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            _nonce,
            _precinctAddress,
            _jurisdictionArea,
            _stateCode,
            id
        ));

        _validateSignatures(messageHash, _signatures, _signers, _stateCode);

        _initializeBranch(
            id,
            _precinctAddress,
            _jurisdictionArea,
            _stateCode
        );

        emit BranchUpdate(
            id,
            _precinctAddress,
            _jurisdictionArea,
            _stateCode
        );

    }
    
    // update a pre existing branch
    function updateBranch(
        string memory _id, 
        string memory _precinctAddress,
        uint _jurisdictionArea,
        uint _stateCode,
        uint _nonce,
        bytes[] memory _signatures,
        address[] memory _signers
    ) external onlyModerator(_stateCode) {
        if(_id.equal("") || _precinctAddress.equal("") || _jurisdictionArea == 0) revert InvalidInput();

        bytes32 id = keccak256(abi.encode(_id));
        Branch storage _branch = branches[id];

        if(_branch.stateCode != _stateCode || _stateCode == 0) revert BranchDoesNotExists();

        if(_signatures.length != _signers.length) revert LengthMismatch();
        if((moderatorCount[_stateCode] / 2) + 1  > _signers.length) revert NotEnoughSignatures();


        bytes32 messageHash = UpdateBranch.hash(UpdateBranch.UpdateBranchVote(
            _nonce,
            _precinctAddress,
            _jurisdictionArea,
            _stateCode,
            id
        ));

        _validateSignatures(messageHash, _signatures, _signers, _stateCode);

        _branch.precinctAddress = _precinctAddress;
        _branch.jurisdictionArea = _jurisdictionArea;

        emit BranchUpdate(
            id,
            _precinctAddress,
            _jurisdictionArea,
            _stateCode
        );

    }

    // add a moderator
    function addModerator(
        uint _nonce,
        uint _stateCode,
        address _officer, 
        string memory _name, 
        bytes32 _legalNumber, 
        bytes32 _badge, 
        bytes32 _branchId, 
        Rank _rank,
        bytes memory _signature,
        address _signer
    ) external onlyModerator(_stateCode) {
        
        // moderator cannot hire officers or detectives
        if (_rank != Rank.MODERATOR) { revert InvalidRank(); }
        _onboard(_nonce, _stateCode, _officer, _name, _legalNumber, _badge, _branchId, _rank, _signature, _signer);
    }

    function onboard(
        uint _nonce,
        uint _stateCode,
        address _officer, 
        string memory _name, 
        bytes32 _legalNumber, 
        bytes32 _badge, 
        bytes32 _branchId, 
        Rank _rank,
        bytes memory _signature,
        address _signer
    ) external onlyRank(Rank.CAPTAIN) {
        // captain cannot hire another captain or moderator
        if (_rank >= Rank.CAPTAIN) { revert InvalidRank(); }
        if (_signer == msg.sender || _signer == _officer) revert InvalidSigner();
        if (branches[_branchId].stateCode == 0) { revert BranchDoesNotExists(); }
        _onboard(_nonce, _stateCode, _officer, _name, _legalNumber, _badge, _branchId, _rank, _signature, _signer);
    }

    function onboardCaptain(
        uint _nonce,
        uint _stateCode,
        address _officer, 
        string memory _name, 
        bytes32 _legalNumber, 
        bytes32 _badge, 
        bytes32 _branchId, 
        Rank _rank,
        bytes memory _signature,
        address _signer
    ) external onlyModerator(_stateCode) {
        // moderator cannot hire officers or detectives
        if (_rank < Rank.CAPTAIN) { revert InvalidRank(); }
        _onboard(_nonce, _stateCode, _officer, _name, _legalNumber, _badge, _branchId, _rank, _signature, _signer);
    }

    function _onboard(
        uint _nonce,
        uint _stateCode,
        address _officer, 
        string memory _name, 
        bytes32 _legalNumber, 
        bytes32 _badge, 
        bytes32 _branchId, 
        Rank _rank,
        bytes memory _signature,
        address _signer
    ) internal {
        
        // sanity checks
        if (_officer == address(0)) { revert InvalidAddress(); }
        if (_name.equal("")) { revert InvalidString(); }
        if (_badge == keccak256(abi.encode(""))) { revert InvalidBadge(); }
        if (_branchId == keccak256(abi.encode(""))) { revert InvalidBranch(); }
        if (_legalNumber == keccak256(abi.encode(""))) { revert InvalidLegalNumber(); }
        if (_rank == Rank.NULL) { revert InvalidRank(); }
        if (!isValidBranch(_branchId)) { revert BranchDoesNotExists(); }

        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            _officer,
            _nonce,
            _name,
            _legalNumber,
            _badge,
            _branchId,
            uint(EmploymentStatus.ACTIVE),
            uint(_rank)
        ));

        _validateSignatures(messageHash, _signature, _signer, _stateCode);

        _addOfficer(
            _stateCode,
            _officer, 
            _name, 
            _legalNumber, 
            _badge, 
            _branchId, 
            _rank
        );

        emit Onboard(
            _officer,
            _name,
            _legalNumber,
            _badge,
            _branchId,
            _rank,
            block.timestamp,
            msg.sender
        );
    }

    function _addModerator(address _address, uint _stateCode) private {
        moderators[_address][_stateCode] = true;
        moderatorCount[_stateCode]++;
    }

    function _initializeBranch(
        bytes32 _id, 
        string memory _precinctAddress,
        uint _jurisdictionArea,
        uint _stateCode
    ) private {
        Branch storage _branch = branches[_id];

        if(_branch.stateCode != 0) revert BranchAlreadyExists();
        _branch.precinctAddress = _precinctAddress;
        _branch.jurisdictionArea = _jurisdictionArea;
        _branch.stateCode = _stateCode;
    }

    function _addOfficer(
        uint _stateCode,
        address _officer, 
        string memory _name, 
        bytes32 _legalNumber, 
        bytes32 _badge, 
        bytes32 _branchId, 
        Rank _rank
    ) private {
        // create officer
        Officer storage newOfficer = officers[_officer];

        if(_rank == Rank.MODERATOR) {
            _addModerator(_officer, _stateCode);
        }
        
        newOfficer.name = _name;
        newOfficer.legalNumber = _legalNumber;
        newOfficer.badge = _badge;
        newOfficer.branchId = _branchId;
        newOfficer.employmentStatus = EmploymentStatus.ACTIVE;
        newOfficer.rank = _rank;
    }

    function _validateSignatures(
        bytes32 _hash,
        bytes[] memory _signatures,
        address[] memory _signers,
        uint _stateCode
    ) private {
        bytes32 _messageHash = _hashTypedDataV4(_hash);
        if (replay[_messageHash]) revert SignatureReplay();
        replay[_messageHash] = true;
        for (uint i = 0; i < _signatures.length; ++i) {
            if(!(
                SignatureChecker.isValidSignatureNow(_signers[i], _messageHash, _signatures[i]) && moderators[_signers[i]][_stateCode]
            )) revert InvalidSignature();
        }   
    }

    function _validateSignatures(
        bytes32 _hash,
        bytes memory _signature,
        address _signer,
        uint _stateCode
    ) private {
        bytes32 _messageHash = _hashTypedDataV4(_hash);
        if (replay[_messageHash]) revert SignatureReplay();
        replay[_messageHash] = true;
        if(!(
            SignatureChecker.isValidSignatureNow(_signer, _messageHash, _signature) && moderators[_signer][_stateCode]
        )) revert InvalidSignature();
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32 domainSeparator) {
        domainSeparator = _domainSeparatorV4();
    }

}

//TODO: check for stateCode either put it in signing scheme or put a check on it from branches that the given branch exists in the state

//TODO: remove signer == sender 

//TODO: shift events to private funnctions