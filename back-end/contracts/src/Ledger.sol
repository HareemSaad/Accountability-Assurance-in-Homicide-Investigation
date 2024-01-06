// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./Utils/Error.sol";
import "./Libraries/CreateBranch.sol";
import "./Libraries/UpdateBranch.sol";
import "./Libraries/Onboard.sol";
import "./Libraries/UpdateOfficer.sol";
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

    event OfficerAddressUpdated (
        address indexed oldAddr,
        address indexed newAddr,
        bytes32 legalNumber, 
        uint when, 
        address from
    );

    event OfficerNameUpdated (
        address indexed officerAddress,
        string indexed name,
        bytes32 legalNumber, 
        uint when, 
        address from
    );

    event Promotion (
        address indexed officer,
        Rank indexed prevRank,
        Rank indexed newRank
    );

    constructor(
        bytes32 _branchId, 
        string memory _precinctAddress,
        uint _jurisdictionArea,
        uint _stateCode,
        address _officer, 
        string memory _name, 
        bytes32 _legalNumber, 
        bytes32 _badge
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
            Rank.MODERATOR
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

        _validateSignatures(messageHash, _signatures, _signers);

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

        _validateSignatures(messageHash, _signatures, _signers);

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
        uint _senderStateCode,
        address _officer, 
        string memory _name, 
        bytes32 _legalNumber, 
        bytes32 _badge, 
        bytes32 _branchId,
        bytes memory _signature,
        address _signer
    ) external onlyModerator(_senderStateCode) {
        
        // moderator cannot hire officers or detectives
        _onboard(_nonce, _stateCode, _officer, _name, _legalNumber, _badge, _branchId, Rank.MODERATOR, _signature, _signer);
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
        bytes memory _signature,
        address _signer
    ) external onlyModerator(_stateCode) {
        // moderator cannot hire officers or detectives
        _onboard(_nonce, _stateCode, _officer, _name, _legalNumber, _badge, _branchId, Rank.CAPTAIN, _signature, _signer);
    }

    function promote(
        uint _stateCode,
        address _officerAddress, 
        Rank _newRank
    ) external onlyModerator(_stateCode) {

        Officer memory _officer = officers[_officerAddress];
        Rank _prevRank = _officer.rank;

        // sanity checks
        if (_officer.employmentStatus != EmploymentStatus.ACTIVE) { revert InactiveOfficer(); }
        if (_officerAddress == address(0)) { revert InvalidAddress(); }
        if (_newRank == Rank.NULL || _newRank == _prevRank) { revert InvalidRank(); }
        // sanity check to check if moderator's and officer's state code are same
        if (_stateCode != branches[_officer.branchId].stateCode) revert ModeratorOfDifferentState();

        // state change
        officers[_officerAddress].rank = _newRank;

        // event
        emit Promotion (
            _officerAddress,
            _prevRank,
            _newRank
        );

        // gas opt
        delete _officer;
        delete _prevRank;
    }

    function updateAddress(
        uint _nonce,
        uint _stateCode,
        address _officer,
        address _newAddress,
        bytes memory _signature,
        address _signer
    ) external onlyModerator(_stateCode) {

        if (_newAddress == address(0)) revert ZeroAddress();
        if (_signer != msg.sender || _signer == _officer) revert InvalidSigner();
        if (officers[_signer].rank != Rank.MODERATOR) revert InvalidSigner();
        Officer memory officerToUpdate = officers[_officer];
        officers[_newAddress] = officerToUpdate;
        delete(officers[_officer]);

        if (_stateCode != branches[officerToUpdate.branchId].stateCode) revert ModeratorOfDifferentState();

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            _newAddress,
            _nonce,
            officerToUpdate.name,
            officerToUpdate.legalNumber,
            officerToUpdate.badge,
            officerToUpdate.branchId,
            uint(officerToUpdate.rank), 
            UpdateOfficer.UpdateType.ADDRESS
        ));

        _validateSignatures(messageHash, _signature, _signer);

        emit OfficerAddressUpdated (
            _officer,
            _newAddress,
            officerToUpdate.legalNumber, 
            block.timestamp, 
            msg.sender
        );
    }

    function updateName(
        uint _nonce,
        uint _stateCode,
        address _officer,
        string memory _newName,
        bytes memory _signature,
        address _signer
    ) external onlyModerator(_stateCode) {

        if (_newName.equal("")) revert InvalidString();
        if (_signer != msg.sender || _signer == _officer) revert InvalidSigner();
        if (officers[_signer].rank != Rank.MODERATOR) revert InvalidSigner();
        Officer memory officerToUpdate = officers[_officer];
        officers[_officer].name = _newName;

        if (_stateCode != branches[officerToUpdate.branchId].stateCode) revert ModeratorOfDifferentState();

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            _officer,
            _nonce,
            _newName,
            officerToUpdate.legalNumber,
            officerToUpdate.badge,
            officerToUpdate.branchId,
            uint(officerToUpdate.rank), 
            UpdateOfficer.UpdateType.ADDRESS
        ));

        _validateSignatures(messageHash, _signature, _signer);

        emit OfficerNameUpdated (
            _officer,
            _newName,
            officerToUpdate.legalNumber, 
            block.timestamp, 
            msg.sender
        );
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
        if (!isValidBranch(_branchId) && _rank != Rank.MODERATOR ) { revert BranchDoesNotExists(); }
        if (_stateCode != branches[_branchId].stateCode && _rank != Rank.MODERATOR) revert ModeratorOfDifferentState();
        if (officers[_signer].rank != Rank.MODERATOR) revert InvalidSigner();

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

        _validateSignatures(messageHash, _signature, _signer);

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

        branches[_branchId].numberOfOfficers++;

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

    function _validateSignatures(
        bytes32 _hash,
        bytes[] memory _signatures,
        address[] memory _signers
    ) private {
        bytes32 _messageHash = _hashTypedDataV4(_hash);
        if (replay[_messageHash]) revert SignatureReplay();
        replay[_messageHash] = true;
        for (uint i = 0; i < _signatures.length; ++i) {
            if(!(
                SignatureChecker.isValidSignatureNow(_signers[i], _messageHash, _signatures[i]) && officers[_signers[i]].rank == Rank.MODERATOR
            )) revert InvalidSignature();
        }   
    }

    function _validateSignatures(
        bytes32 _hash,
        bytes memory _signature,
        address _signer
    ) private {
        bytes32 _messageHash = _hashTypedDataV4(_hash);
        if (replay[_messageHash]) revert SignatureReplay();
        replay[_messageHash] = true;
        if(!(
            SignatureChecker.isValidSignatureNow(_signer, _messageHash, _signature)
        )) revert InvalidSignature();
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32 domainSeparator) {
        domainSeparator = _domainSeparatorV4();
    }

}