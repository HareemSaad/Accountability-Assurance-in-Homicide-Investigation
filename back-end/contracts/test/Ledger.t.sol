// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "./../src/Ledger.sol";
import "./../src/Libraries/CreateBranch.sol";
import "./../src/Libraries/UpdateBranch.sol";
import "./../src/Libraries/Onboard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract OfficersTest is Test {

    using CreateBranch for CreateBranch.CreateBranchVote;

    Ledger ledger;
    address ZER0_ADDRESS = address(0);
    bytes32 PRECINCT1 = keccak256(abi.encode("PRECINCT 1"));
    bytes32 PRECINCT2 = keccak256(abi.encode("PRECINCT 2"));
    uint256 _moderator1PrivateKey = 0xB0B;
    address moderator1 = vm.addr(_moderator1PrivateKey); //0x0376AAc07Ad725E01357B1725B5ceC61aE10473c
    uint256 _moderator2PrivateKey = 0xABB1;
    address moderator2 = vm.addr(_moderator2PrivateKey); //0x4a79fB1C667Ff8AF3e5B50925747AA39D9f74262
    address captain1 = address(2); //E11
    address captain2 = address(3);
    uint256 _alicePrivateKey = 0xA11CE;
    address detective1 = vm.addr(_alicePrivateKey); //0xe05fcC23807536bEe418f142D19fa0d21BB0cfF7

    function setUp() public {
        ledger = new Ledger(
            moderator1,
            "Bob",
            keccak256(abi.encode("BOB-1")),
            PRECINCT1
        );
        // testOnboardCaptainByModerator();

    }

    function testNewBranch() public {
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            "5th Avenue",
            123456,
            88886,
            PRECINCT1
        ));

        bytes[] memory signatures = new bytes[](2);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator1PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        (v, r, s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator1Signature;
        signatures[1] = moderator2Signature;

        address[] memory signers = new address[](2);

        signers[0] = moderator1;
        signers[1] = moderator2;
        
        vm.startPrank(moderator1);

        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            123456,
            88886,
            1,
            signatures,
            signers
        );

        (
            string memory precinctAddress,
            uint jurisdictionArea,
            uint stateCode,
            uint numberOfOfficers
        ) = ledger.branches(PRECINCT1);

        assertEq(precinctAddress, "5th Avenue");
        assertEq(stateCode, 88886);
        assertEq(jurisdictionArea, 123456);
        assertEq(numberOfOfficers, 0);

        vm.stopPrank();
    }

    function testDuplicateBranch() public {
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            "5th Avenue",
            123456,
            88886,
            PRECINCT1
        ));

        bytes[] memory signatures = new bytes[](2);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator1PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        (v, r, s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator1Signature;
        signatures[1] = moderator2Signature;

        address[] memory signers = new address[](2);

        signers[0] = moderator1;
        signers[1] = moderator2;

        testNewBranch();

        vm.startPrank(moderator1);

        vm.expectRevert(BranchAlreadyExists.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            123456,
            88886,
            1,
            signatures,
            signers
        );

        vm.stopPrank();
    }

    function testCreateBranchIncorrectInput() public {

        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            "5th Avenue",
            123456,
            88886,
            PRECINCT1
        ));

        bytes[] memory signatures = new bytes[](2);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator1PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        (v, r, s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator1Signature;
        signatures[1] = moderator2Signature;

        address[] memory signers = new address[](2);

        signers[0] = moderator1;
        signers[1] = moderator2;

        bytes[] memory signaturesHalf = new bytes[](1);
        signaturesHalf[0] = moderator1Signature;

        address[] memory signersHalf = new address[](1);
        signersHalf[0] = moderator1;

        vm.startPrank(moderator1);

        vm.expectRevert(InvalidInput.selector);
        ledger.createBranch(
            "",
            "5th Avenue",
            123456,
            88886,
            1,
            signatures,
            signers
        );

        vm.expectRevert(InvalidInput.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "",
            123456,
            88886,
            1,
            signatures,
            signers
        );

        vm.expectRevert(OnlyModerator.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            123456,
            0,
            1,
            signatures,
            signers
        );

        vm.expectRevert(InvalidInput.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            0,
            88886,
            1,
            signatures,
            signers
        );

        vm.expectRevert(LengthMismatch.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            123456,
            88886,
            1,
            signaturesHalf,
            signers
        );

        vm.expectRevert(NotEnoughSignatures.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            123456,
            88886,
            1,
            signaturesHalf,
            signersHalf
        );

        signers[0] = moderator2;

        vm.expectRevert(InvalidSignature.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            123456,
            88886,
            1,
            signatures,
            signers
        );


        vm.expectRevert(InvalidSignature.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            123456,
            88886,
            0,
            signatures,
            signers
        );

        vm.stopPrank();
    }

    function testUpdateBranch() public {
        testNewBranch(); 

        bytes32 messageHash = UpdateBranch.hash(UpdateBranch.UpdateBranchVote(
            1,
            "6th Avenue",
            123456,
            88886,
            PRECINCT1
        ));

        bytes[] memory signatures = new bytes[](2);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator1PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        (v, r, s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator1Signature;
        signatures[1] = moderator2Signature;

        address[] memory signers = new address[](2);

        signers[0] = moderator1;
        signers[1] = moderator2;
        
        vm.startPrank(moderator1);

        ledger.updateBranch(
            "PRECINCT 1",
            "6th Avenue",
            123456,
            88886,
            1,
            signatures,
            signers
        );

        (
            string memory precinctAddress,
            uint jurisdictionArea,
            uint stateCode,
            uint numberOfOfficers
        ) = ledger.branches(PRECINCT1);

        assertEq(precinctAddress, "6th Avenue");
        assertEq(stateCode, 88886);
        assertEq(jurisdictionArea, 123456);
        assertEq(numberOfOfficers, 0);

        vm.stopPrank();
    }

    function testUpdateBranchIncorrectInput() public {

        bytes32 messageHash = UpdateBranch.hash(UpdateBranch.UpdateBranchVote(
            1,
            "6th Avenue",
            123456,
            88886,
            PRECINCT1
        ));

        bytes[] memory signatures = new bytes[](2);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator1PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        (v, r, s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator1Signature;
        signatures[1] = moderator2Signature;

        address[] memory signers = new address[](2);

        signers[0] = moderator1;
        signers[1] = moderator2;

        bytes[] memory signaturesHalf = new bytes[](1);
        signaturesHalf[0] = moderator1Signature;

        address[] memory signersHalf = new address[](1);
        signersHalf[0] = moderator1;

        testNewBranch(); 

        vm.startPrank(moderator1);

        vm.expectRevert(InvalidInput.selector);
        ledger.updateBranch(
            "",
            "6th Avenue",
            123456,
            88886,
            1,
            signatures,
            signers
        );

        vm.expectRevert(InvalidInput.selector);
        ledger.updateBranch(
            "PRECINCT 1",
            "",
            123456,
            88886,
            1,
            signatures,
            signers
        );

        vm.expectRevert(OnlyModerator.selector);
        ledger.updateBranch(
            "PRECINCT 1",
            "6th Avenue",
            123456,
            0,
            1,
            signatures,
            signers
        );

        vm.expectRevert(InvalidInput.selector);
        ledger.updateBranch(
            "PRECINCT 1",
            "6th Avenue",
            0,
            88886,
            1,
            signatures,
            signers
        );

        vm.expectRevert(LengthMismatch.selector);
        ledger.updateBranch(
            "PRECINCT 1",
            "6th Avenue",
            123456,
            88886,
            1,
            signaturesHalf,
            signers
        );

        vm.expectRevert(NotEnoughSignatures.selector);
        ledger.updateBranch(
            "PRECINCT 1",
            "6th Avenue",
            123456,
            88886,
            1,
            signaturesHalf,
            signersHalf
        );

        signers[0] = moderator2;

        vm.expectRevert(InvalidSignature.selector);
        ledger.updateBranch(
            "PRECINCT 1",
            "6th Avenue",
            123456,
            88886,
            1,
            signatures,
            signers
        );


        vm.expectRevert(InvalidSignature.selector);
        ledger.updateBranch(
            "PRECINCT 1",
            "6th Avenue",
            123456,
            88886,
            0,
            signatures,
            signers
        );

        vm.stopPrank();
    }

    function testOnboard() public {
        testNewBranch();
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT1,
            uint(Ledger.EmploymentStatus.ACTIVE),
            uint(Ledger.Rank.DETECTIVE)
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator1PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(captain1);

        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT1,
            Ledger.Rank.DETECTIVE,
            moderator1Signature,
            moderator1
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(detective1);

        assertEq(name, "Alice");
        assertEq(legalNumber, keccak256(abi.encode("678843")));
        assertEq(badge, keccak256(abi.encode("ALICE1")));
        assertEq(branchId, PRECINCT1);
        assertEq(uint(employmentStatus), uint(Ledger.EmploymentStatus.ACTIVE));
        assertEq(uint(rank), uint(Ledger.Rank.DETECTIVE));

        vm.stopPrank();
    }

    function testOnboardInput() public {
        testNewBranch();
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT1,
            uint(Ledger.EmploymentStatus.ACTIVE),
            uint(Ledger.Rank.DETECTIVE)
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator1PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(captain1);

        vm.expectRevert(InvalidRank.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT1,
            Ledger.Rank.CAPTAIN,
            moderator1Signature,
            moderator1
        );

        vm.expectRevert(InvalidRank.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT1,
            Ledger.Rank.NULL,
            moderator1Signature,
            moderator1
        );

        vm.expectRevert(InvalidAddress.selector);
        ledger.onboard(
            1,
            88886,
            address(0),
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT1,
            Ledger.Rank.DETECTIVE,
            moderator1Signature,
            moderator1
        );

        vm.expectRevert(InvalidString.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT1,
            Ledger.Rank.DETECTIVE,
            moderator1Signature,
            moderator1
        );

        vm.expectRevert(InvalidBadge.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("")),
            PRECINCT1,
            Ledger.Rank.DETECTIVE,
            moderator1Signature,
            moderator1
        );

        vm.expectRevert(InvalidBranch.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            keccak256(abi.encode("")),
            Ledger.Rank.DETECTIVE,
            moderator1Signature,
            moderator1
        );

        vm.expectRevert(InvalidLegalNumber.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT1,
            Ledger.Rank.DETECTIVE,
            moderator1Signature,
            moderator1
        );

        vm.expectRevert(InvalidSignature.selector);
        ledger.onboard(
            1,
            88882,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT1,
            Ledger.Rank.DETECTIVE,
            moderator1Signature,
            moderator1
        );

        vm.expectRevert(BranchDoesNotExists.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.DETECTIVE,
            moderator1Signature,
            moderator1
        );

        vm.expectRevert(InvalidSignature.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT1,
            Ledger.Rank.DETECTIVE,
            moderator1Signature,
            moderator2
        );

        vm.stopPrank();
    }

    //test isValidBranch

    function _hashTypedDataV4(bytes32 structHash) internal view virtual returns (bytes32) {
        return ECDSA.toTypedDataHash(ledger.DOMAIN_SEPARATOR(), structHash);
    }
}