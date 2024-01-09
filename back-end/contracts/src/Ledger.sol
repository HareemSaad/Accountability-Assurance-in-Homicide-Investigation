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
import "./Libraries/TransferBranch.sol";
import "forge-std/Test.sol";

/// @title Ledger Contract
/// @notice Manages officer records and branch details for a law enforcement agency
contract Ledger is EIP712 {

    using Strings for string;

    /// @notice Emitted when a branch is updated
    /// @param id Unique identifier of the branch
    /// @param precinctAddress Address of the branch
    /// @param jurisdictionArea Jurisdiction area code of the branch
    /// @param stateCode State code of the branch
    event BranchUpdate(
        bytes32 indexed id,
        string precinctAddress,
        uint indexed jurisdictionArea,
        uint indexed stateCode
    );

    /// @dev Emitted when a new officer is onboarded
    /// @param officer Address of the onboarded officer
    /// @param name Name of the onboarded officer
    /// @param legalNumber Legal identification number of the onboarded officer
    /// @param badge Badge number of the onboarded officer
    /// @param branchId Identifier of the officer's assigned branch
    /// @param rank Rank of the onboarded officer
    /// @param when Timestamp of when the officer was onboarded
    /// @param from Address of the moderator who onboarded the officer
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

    /// @dev Emitted when an officer's address is updated
    /// @param oldAddr Previous address of the officer
    /// @param newAddr New address of the officer
    /// @param legalNumber Legal identification number of the officer
    /// @param when Timestamp of the update
    /// @param from Address of the moderator who updated the officer's address
    event OfficerAddressUpdated (
        address indexed oldAddr,
        address indexed newAddr,
        bytes32 legalNumber, 
        uint when, 
        address from
    );

    /// @dev Emitted when an officer's name is updated
    /// @param officerAddress Address of the officer whose name is updated
    /// @param name New name of the officer
    /// @param legalNumber Legal identification number of the officer
    /// @param when Timestamp of the name update
    /// @param from Address of the moderator who updated the officer's name
    event OfficerNameUpdated (
        address indexed officerAddress,
        string indexed name,
        bytes32 legalNumber, 
        uint when, 
        address from
    );

    /// @dev Emitted when an officer's badge number is updated
    /// @param officerAddress Address of the officer whose badge number is updated
    /// @param badge New badge number of the officer
    /// @param legalNumber Legal identification number of the officer
    /// @param when Timestamp of the badge number update
    /// @param from Address of the moderator who updated the officer's badge number
    event OfficerBadgeUpdated (
        address indexed officerAddress,
        bytes32 indexed badge,
        bytes32 legalNumber, 
        uint when, 
        address from
    );

    /// @dev Emitted when an officer is promoted to a new rank
    /// @param officer Address of the officer who is promoted
    /// @param prevRank Previous rank of the officer
    /// @param newRank New rank of the officer
    event Promotion (
        address indexed officer,
        Rank indexed prevRank,
        Rank indexed newRank
    );
    
    /// @dev Emitted when an officer is transferred from one branch to another
    /// @param officer Address of the transferred officer
    /// @param fromBranchId Identifier of the officer's previous branch
    /// @param toBranchId Identifier of the officer's new branch
    event OfficerTransferred(
        address indexed officer,
        bytes32 indexed fromBranchId,
        bytes32 indexed toBranchId
    );

    /// @notice Initializes a new Ledger contract with a branch and a moderator
    /// @param _branchId Unique identifier for the initial branch
    /// @param _precinctAddress Address of the initial branch
    /// @param _jurisdictionArea Jurisdiction area of the initial branch
    /// @param _stateCode State code of the initial branch
    /// @param _officer Address of the initial moderator
    /// @param _name Name of the initial moderator
    /// @param _legalNumber Legal identification number of the initial moderator
    /// @param _badge Badge number of the initial moderator
    /// @dev creates a branch using `_branchId`
    /// @dev creates a moderator for said branch for `_officer`
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

    /// @param name name of the officer
    /// @param legalNumber hash of a real world identification number; like social security number
    /// @param badge hash of the badge number
    /// @param branchId hash of branchId
    /// @param employmentStatus status of employment see `EmploymentStatus`
    /// @param rank rank of officer see `Rank`
    struct Officer {
        string name;
        bytes32 legalNumber;
        bytes32 badge;
        bytes32 branchId;
        EmploymentStatus employmentStatus;
        Rank rank;
    }

    /// @param precinctAddress address of precinct
    /// @param jurisdictionArea jurisdiction area code e.g zip code
    /// @param stateCode state code e.g city code
    /// @param numberOfOfficers number of officers in a branch
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
    mapping (bytes32 => bool) public legalNumber;
    mapping (bytes32 => bool) public badge;

    /// @dev Checks if a given branch ID represents a valid branch.
    /// @param id The branch identifier to check.
    /// @return True if the branch is valid, otherwise false.
    function isValidBranch(bytes32 id) public view returns (bool) {
        return (branches[id].stateCode != 0);
    }

    /// @dev Checks if a given state code has at least one moderator.
    /// @param stateCode The state code to check.
    /// @return True if the state has moderators, otherwise false.
    function isValidState(uint stateCode) public view returns (bool) {
        return (moderatorCount[stateCode] != 0);
    }

    /// @notice Checks if the calling officer's employment status is valid based on branch ID, state code, and badge.
    /// @dev The function verifies if the calling officer is active, in the specified branch, and matches the badge number.
    /// @param _branchId The branch identifier to check against the officer's branch.
    /// @param _stateCode The state code to verify against the officer's branch's state code.
    /// @param _badge The badge number to verify against the officer's badge number.
    /// @return True if the officer's employment status is active, and their branch ID, state code, and badge match the provided parameters. Otherwise, returns false.
    function isValidEmployment(bytes32 _branchId, uint _stateCode, bytes32 _badge) public view returns (bool) {
        Officer memory _officer = officers[msg.sender];
        if (_officer.branchId == _branchId && branches[_officer.branchId].stateCode == _stateCode) {
            if (_officer.employmentStatus == EmploymentStatus.ACTIVE && _officer.badge == _badge) {
                return true;
            }
        }
        return false;
    }

    /// @notice Creates a new branch with required signatures from moderators
    /// @param _id Unique string identifier for the new branch
    /// @param _precinctAddress Address of the new branch
    /// @param _jurisdictionArea Jurisdiction area code of the new branch
    /// @param _stateCode State code of the new branch
    /// @param _nonce Nonce for signature verification
    /// @param _signatures Array of signatures from moderators
    /// @param _signers Array of addresses corresponding to the moderators who signed
    /// @dev to create a branch a moderator for that branch's stateCode should exist
    /// @dev needs to be signed by more than half of the state's moderators to be passed
    /// @dev moderator's should sign `CreateBranch` struct
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
    
    /// @notice Updates an existing branch after verification and authorization by moderators.
    /// @dev Has to be signed by atleast half of the moderators of state
    /// @param _id The unique identifier of the branch.
    /// @param _precinctAddress The new address of the branch.
    /// @param _jurisdictionArea The new jurisdiction area of the branch.
    /// @param _stateCode The state code of the branch.
    /// @param _nonce A nonce for signature verification.
    /// @param _signatures Signatures from moderators to authorize the branch update.
    /// @param _signers Addresses of moderators who provided the signatures.
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

    /// @notice Adds a new moderator to a branch.
    /// @param _nonce A nonce for the operation to prevent replay attacks.
    /// @param _stateCode State code of the branch.
    /// @param _senderStateCode State code of the sender (moderator).
    /// @param _officer Address of the new moderator.
    /// @param _name Name of the new moderator.
    /// @param _legalNumber Legal identification number of the new moderator.
    /// @param _badge Badge number of the new moderator.
    /// @param _branchId Branch ID where the moderator is being assigned.
    /// @param _signature Signature of the existing moderator authorizing the addition.
    /// @param _signer Address of the existing moderator.
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

    /// @notice Onboards a new officer or detective after validation and authorization.
    /// @dev Called by the captain of the onboarding branch
    /// @dev Onboarding signed by a moderator of the same state code
    /// @param _nonce A nonce for the operation to prevent replay attacks.
    /// @param _stateCode State code of the branch.
    /// @param _officer Address of the new officer or moderator.
    /// @param _name Name of the new officer or moderator.
    /// @param _legalNumber Legal identification number.
    /// @param _badge Badge number.
    /// @param _branchId Branch ID where the officer or moderator is being assigned.
    /// @param _rank Rank of the new officer or moderator.
    /// @param _signature Signature of the authorizing officer.
    /// @param _signer Address of the authorizing officer.
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

    /// @notice Onboards a new captain after validation and authorization by a moderator.
    /// @dev Onboarding signed by a moderator of the same state code
    /// @param _nonce A nonce for the operation to prevent replay attacks.
    /// @param _stateCode State code of the branch.
    /// @param _officer Address of the new captain.
    /// @param _name Name of the new captain.
    /// @param _legalNumber Legal identification number.
    /// @param _badge Badge number.
    /// @param _branchId Branch ID where the captain is being assigned.
    /// @param _signature Signature of the authorizing moderator.
    /// @param _signer Address of the authorizing moderator.
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

    /// @notice Promotes an existing officer to a new rank.
    /// @param _stateCode State code of the branch.
    /// @param _officerAddress Address of the officer being promoted.
    /// @param _newRank The new rank to which the officer is being promoted.
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

    /// @notice Validates and processes officer transfer request between branches
    /// @dev Requires signatures from captains of both the current and target branch
    /// @dev If branches are in different StateCodes its needs to be called by the moderator of the current state
    /// @param _nonce Nonce for signature verification
    /// @param _stateCode State code for moderator verification
    /// @param _officerAddress Address of the officer to be transferred
    /// @param _toBranchId Identifier of the target branch for transfer
    /// @param _signatures Array containing two signatures for the transfer
    /// @param _signers Array containing addresses of the signers (captains)
    function transferOfficer(
        uint _nonce,
        uint _stateCode,
        address _officerAddress,
        bytes32 _toBranchId,
        bytes[2] memory _signatures,
        address[2] memory _signers
    ) external onlyModerator(_stateCode) {
        Officer memory _officer = officers[_officerAddress];
        // Check state code consistency
        if(branches[_officer.branchId].stateCode != _stateCode) { revert ModeratorOfDifferentState(); }

        // Signature verification
        if(_signatures.length == _signers.length && _signatures.length != 2) { revert NotEnoughSignatures(); }
        
        TransferBranch.TransferBranchRequest memory request = TransferBranch.TransferBranchRequest({
            verifiedAddress: _officerAddress,
            nonce: _nonce,
            name: _officer.name,
            legalNumber: _officer.legalNumber,
            badge: _officer.badge,
            branchId: _officer.branchId,
            toBranchId: _toBranchId,
            employmentStatus: uint(_officer.employmentStatus),
            rank: uint(_officer.rank),
            reciever: false
        });

        bytes32 messageHash = TransferBranch.hash(request);

        if(officers[_signers[0]].rank != Rank.CAPTAIN || officers[_signers[1]].rank != Rank.CAPTAIN) { revert SignerNotCaptain(); }
        if(officers[_signers[0]].branchId != _officer.branchId || officers[_signers[1]].branchId != _toBranchId) { revert InvalidBranch(); }

        _validateSignatures(messageHash, _signatures[0], _signers[0]);

        request.reciever = true;
        messageHash = TransferBranch.hash(request);

        _validateSignatures(messageHash, _signatures[1], _signers[1]);

        // State changes
        Branch storage fromBranch = branches[_officer.branchId];
        Branch storage toBranch = branches[_toBranchId];

        fromBranch.numberOfOfficers--;
        toBranch.numberOfOfficers++;
        officers[_officerAddress].branchId = _toBranchId;

        // Emit event
        emit OfficerTransferred(
            _officerAddress,
            request.branchId,
            request.toBranchId
        );

        delete request;
        delete _officer;
    }

    /// @notice Updates the address of an officer
    /// @param _nonce Nonce for signature verification
    /// @param _stateCode State code for moderator verification
    /// @param _officer Address of the officer to update
    /// @param _newAddress New address of the officer
    /// @param _signature Signature of the moderator authorizing the update
    /// @param _signer Address of the moderator who signed the update request
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

    /// @notice Updates the badge number of an officer
    /// @param _nonce Nonce for signature verification
    /// @param _stateCode State code for moderator verification
    /// @param _officer Address of the officer to update
    /// @param _newBadge New badge number of the officer
    /// @param _signature Signature of the moderator authorizing the update
    /// @param _signer Address of the moderator who signed the update request
    function updateBadge(
        uint _nonce,
        uint _stateCode,
        address _officer,
        bytes32 _newBadge,
        bytes memory _signature,
        address _signer
    ) external onlyModerator(_stateCode) {

        if (_newBadge == keccak256(abi.encode(""))) { revert InvalidBadge(); }
        if (badge[_newBadge]) { revert InvalidBadge(); }
        if (_signer != msg.sender || _signer == _officer) revert InvalidSigner();
        if (officers[_signer].rank != Rank.MODERATOR) revert InvalidSigner();
        Officer memory officerToUpdate = officers[_officer];

        if (_stateCode != branches[officerToUpdate.branchId].stateCode) revert ModeratorOfDifferentState();

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            _officer,
            _nonce,
            officerToUpdate.name,
            officerToUpdate.legalNumber,
            _newBadge,
            officerToUpdate.branchId,
            uint(officerToUpdate.rank), 
            UpdateOfficer.UpdateType.BADGE
        ));

        _validateSignatures(messageHash, _signature, _signer);

        badge[officerToUpdate.badge] = false;
        badge[_newBadge] = true;
        officers[_officer].badge = _newBadge;

        emit OfficerBadgeUpdated (
            _officer,
            _newBadge,
            officerToUpdate.legalNumber, 
            block.timestamp, 
            msg.sender
        );
    }

    /// @notice Updates the name of an officer
    /// @param _nonce Nonce for signature verification
    /// @param _stateCode State code for moderator verification
    /// @param _officer Address of the officer to update
    /// @param _newName New name of the officer
    /// @param _signature Signature of the moderator authorizing the update
    /// @param _signer Address of the moderator who signed the update request
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

    /// @notice Internal function to onboard a new officer or moderator
    /// @param _nonce Nonce for signature verification
    /// @param _stateCode State code for moderator verification
    /// @param _officer Address of the new officer
    /// @param _name Name of the new officer
    /// @param _legalNumber Legal identification number of the new officer
    /// @param _badge Badge number of the new officer
    /// @param _branchId Identifier of the officer's assigned branch
    /// @param _rank Rank of the new officer
    /// @param _signature Signature of the moderator authorizing the onboarding
    /// @param _signer Address of the moderator who signed the onboarding request
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
        if (badge[_badge]) { revert InvalidBadge(); }
        if (legalNumber[_legalNumber]) { revert InvalidLegalNumber(); }
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
        badge[newOfficer.badge] = true;
        legalNumber[newOfficer.legalNumber] = true;

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