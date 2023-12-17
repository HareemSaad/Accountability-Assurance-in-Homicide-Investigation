// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "./../src/Ledger.sol";
import "./../src/Libraries/CreateBranch.sol";
import "./../src/Libraries/UpdateBranch.sol";
import "./../src/Libraries/Onboard.sol";
import "./../src/Libraries/UpdateOfficer.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract OfficersTest is Test {

    using CreateBranch for CreateBranch.CreateBranchVote;

    Ledger ledger;
    address ZER0_ADDRESS = address(0);
    bytes32 PRECINCT1 = keccak256(abi.encode("PRECINCT 1"));
    bytes32 PRECINCT2 = keccak256(abi.encode("PRECINCT 2"));
    bytes32 PRECINCT3 = keccak256(abi.encode("PRECINCT 3"));
    uint256 _moderator1PrivateKey = 0xB0B;
    address moderator1 = vm.addr(_moderator1PrivateKey); //0x0376AAc07Ad725E01357B1725B5ceC61aE10473c
    uint256 _moderator2PrivateKey = 0xABB1;
    address moderator2 = vm.addr(_moderator2PrivateKey); //0x4a79fB1C667Ff8AF3e5B50925747AA39D9f74262
    uint256 _moderator3PrivateKey = 0xABE;
    address moderator3 = vm.addr(_moderator3PrivateKey);
    address captain1 = address(2); //E11
    address captain2 = address(3);
    uint256 _alicePrivateKey = 0xA11CE;
    address detective1 = vm.addr(_alicePrivateKey); //0xe05fcC23807536bEe418f142D19fa0d21BB0cfF7
    address detective2 = address(88);

    function setUp() public {
        ledger = new Ledger(
            PRECINCT2,
            "7th Avenue",
            3,
            88886,
            moderator2,
            "EDD",
            keccak256(abi.encode("34567")),
            keccak256(abi.encode("EDD-1")),
            Ledger.Rank.MODERATOR
        );

        assertEq(ledger.moderators(moderator2,88886), true);
        (
            string memory precinctAddress,
            uint jurisdictionArea,
            uint stateCode,
            uint numberOfOfficers
        ) = ledger.branches(PRECINCT2);

        assertEq(precinctAddress, "7th Avenue");
        assertEq(stateCode, 88886);
        assertEq(jurisdictionArea, 3);
        assertEq(numberOfOfficers, 1);

        // create a new branch
        // bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
        //     1,
        //     "9th Avenue",
        //     123456,
        //     88888,
        //     PRECINCT3
        // ));

        // bytes[] memory signatures = new bytes[](1);

        // (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        // bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        // signatures[0] = moderator2Signature;

        // address[] memory signers = new address[](1);

        // signers[0] = moderator2;
        
        // vm.prank(moderator2);
        // ledger.createBranch(
        //     "PRECINCT 3",
        //     "9th Avenue",
        //     123456,
        //     88888,
        //     1,
        //     signatures,
        //     signers
        // );

        // add moderator
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            moderator3,
            2,
            "Abe",
            keccak256(abi.encode("98765")),
            keccak256(abi.encode("ABE-1")),
            PRECINCT3,
            uint(Ledger.EmploymentStatus.ACTIVE),
            uint(Ledger.Rank.MODERATOR)
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator2);
        ledger.addModerator(
            2,
            88888,
            88886,
            moderator3,
            "Abe",
            keccak256(abi.encode("98765")),
            keccak256(abi.encode("ABE-1")),
            PRECINCT3,
            Ledger.Rank.MODERATOR,
            moderator2Signature,
            moderator2
        );

    } 

    function testNewBranch() public {
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            "5th Avenue",
            123456,
            88886,
            PRECINCT1
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator2Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator2;
        
        vm.startPrank(moderator2);

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

    function testReplayBranch() public {
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            "5th Avenue",
            123456,
            88886,
            PRECINCT1
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator2Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator2;

        testNewBranch();

        vm.startPrank(moderator2);

        vm.expectRevert(SignatureReplay.selector);
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

    function testDuplicateBranch() public {
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            "5th Avenue",
            123456,
            88886,
            PRECINCT1
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator2Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator2;

        testNewBranch();

        vm.startPrank(moderator2);

        vm.expectRevert(SignatureReplay.selector);
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

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator2Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator2;

        bytes[] memory signaturesHalf = new bytes[](0);

        address[] memory signersHalf = new address[](0);

        vm.startPrank(moderator2);

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

        signers[0] = moderator1;

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

        bytes32 messageHash = UpdateBranch.hash(UpdateBranch.UpdateBranchVote(
            1,
            "6th Avenue",
            123456,
            88886,
            PRECINCT2
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator2Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator2;
        
        vm.startPrank(moderator2);

        ledger.updateBranch(
            "PRECINCT 2",
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
        ) = ledger.branches(PRECINCT2);

        assertEq(precinctAddress, "6th Avenue");
        assertEq(stateCode, 88886);
        assertEq(jurisdictionArea, 123456);
        assertEq(numberOfOfficers, 1);

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

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator2Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator2;

        bytes[] memory signaturesHalf = new bytes[](0);
        address[] memory signersHalf = new address[](0);

        testNewBranch(); 

        vm.startPrank(moderator2);

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

        signers[0] = moderator1;

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

    function testCaptainOnboard() public {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            captain1,
            1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            uint(Ledger.EmploymentStatus.ACTIVE),
            uint(Ledger.Rank.CAPTAIN)
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator2);

        ledger.onboardCaptain(
            1,
            88886,
            captain1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.CAPTAIN,
            moderator2Signature,
            moderator2
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(captain1);

        assertEq(name, "Alice");
        assertEq(legalNumber, keccak256(abi.encode("678843")));
        assertEq(badge, keccak256(abi.encode("ALICE1")));
        assertEq(branchId, PRECINCT2);
        assertEq(uint(employmentStatus), uint(Ledger.EmploymentStatus.ACTIVE));
        assertEq(uint(rank), uint(Ledger.Rank.CAPTAIN));

        vm.stopPrank();
    }

    function testModeratorOnboard() public {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            moderator1,
            1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            uint(Ledger.EmploymentStatus.ACTIVE),
            uint(Ledger.Rank.MODERATOR)
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator2);

        ledger.addModerator(
            1,
            88886,
            88886,
            moderator1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.MODERATOR,
            moderator2Signature,
            moderator2
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(moderator1);

        assertEq(name, "Alice");
        assertEq(legalNumber, keccak256(abi.encode("678843")));
        assertEq(badge, keccak256(abi.encode("ALICE1")));
        assertEq(branchId, PRECINCT2);
        assertEq(uint(employmentStatus), uint(Ledger.EmploymentStatus.ACTIVE));
        assertEq(uint(rank), uint(Ledger.Rank.MODERATOR));

        vm.stopPrank();
    }

    function testOnboard() public {
        testCaptainOnboard();
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            detective1,
            1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            uint(Ledger.EmploymentStatus.ACTIVE),
            uint(Ledger.Rank.DETECTIVE)
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(captain1);

        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.DETECTIVE,
            moderator2Signature,
            moderator2
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
        assertEq(branchId, PRECINCT2);
        assertEq(uint(employmentStatus), uint(Ledger.EmploymentStatus.ACTIVE));
        assertEq(uint(rank), uint(Ledger.Rank.DETECTIVE));

        vm.stopPrank();
    }

    function testOnboardInput() public {
        testCaptainOnboard();
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            detective1,
            2,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            uint(Ledger.EmploymentStatus.ACTIVE),
            uint(Ledger.Rank.DETECTIVE)
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(captain1);

        vm.expectRevert(InvalidRank.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.CAPTAIN,
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(InvalidRank.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.NULL,
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(InvalidAddress.selector);
        ledger.onboard(
            1,
            88886,
            address(0),
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.DETECTIVE,
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(InvalidString.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.DETECTIVE,
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(InvalidBadge.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("")),
            PRECINCT2,
            Ledger.Rank.DETECTIVE,
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(BranchDoesNotExists.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            keccak256(abi.encode("")),
            Ledger.Rank.DETECTIVE,
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(InvalidLegalNumber.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.DETECTIVE,
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(ModeratorOfDifferentState.selector);
        ledger.onboard(
            1,
            88882,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.DETECTIVE,
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(BranchDoesNotExists.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT3,
            Ledger.Rank.DETECTIVE,
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(InvalidSigner.selector);
        ledger.onboard(
            1,
            88886,
            detective1,
            "Alice",
            keccak256(abi.encode("678843")),
            keccak256(abi.encode("ALICE1")),
            PRECINCT2,
            Ledger.Rank.DETECTIVE,
            moderator2Signature,
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
            PRECINCT2,
            Ledger.Rank.DETECTIVE,
            moderator2Signature,
            moderator2
        );

        vm.stopPrank();
    }

    function testUpdateAddress() public {
        testOnboard();
        
        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(detective1);

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            address(99),
            2,
            name,
            legalNumber,
            badge,
            branchId,
            uint(rank), 
            UpdateOfficer.UpdateType.ADDRESS
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator2);

        ledger.updateAddress(
            2,
            88886,
            detective1,
            address(99),
            moderator2Signature,
            moderator2
        );

        (
            name,
            legalNumber,
            badge,
            branchId,
            employmentStatus,
            rank
        ) = ledger.officers(address(99));

        assertEq(name, "Alice");
        assertEq(legalNumber, keccak256(abi.encode("678843")));
        assertEq(badge, keccak256(abi.encode("ALICE1")));
        assertEq(branchId, PRECINCT2);
        assertEq(uint(employmentStatus), uint(Ledger.EmploymentStatus.ACTIVE));
        assertEq(uint(rank), uint(Ledger.Rank.DETECTIVE));

        vm.stopPrank();
    }

    function testUpdateAddressIncorrectInput() public {
        testOnboard();
        
        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(detective1);

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            address(99),
            2,
            name,
            legalNumber,
            badge,
            branchId,
            uint(rank), 
            UpdateOfficer.UpdateType.ADDRESS
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator2);

        vm.expectRevert(ZeroAddress.selector);
        ledger.updateAddress(
            2,
            88886,
            detective1,
            address(0),
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(OnlyModerator.selector);
        ledger.updateAddress(
            2,
            88888,
            detective1,
            address(99),
            moderator2Signature,
            moderator2
        );

        vm.expectRevert(InvalidSigner.selector);
        ledger.updateAddress(
            2,
            88886,
            detective1,
            address(99),
            moderator2Signature,
            moderator1
        );

        vm.expectRevert(ModeratorOfDifferentState.selector);
        ledger.updateAddress(
            2,
            88886,
            detective2,
            address(99),
            moderator2Signature,
            moderator2
        );

        vm.stopPrank();

        vm.prank(moderator1);
        vm.expectRevert(OnlyModerator.selector);
        ledger.updateAddress(
            2,
            88886,
            detective1,
            address(99),
            moderator2Signature,
            moderator1
        );
    }

    function testUpdateName() public {
        testOnboard();
        
        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(detective1);

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            detective1,
            2,
            "poppy",
            legalNumber,
            badge,
            branchId,
            uint(rank), 
            UpdateOfficer.UpdateType.ADDRESS
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_moderator2PrivateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator2);

        ledger.updateName(
            2,
            88886,
            detective1,
            "poppy",
            moderator2Signature,
            moderator2
        );

        (
            name,
            legalNumber,
            badge,
            branchId,
            employmentStatus,
            rank
        ) = ledger.officers(detective1);

        assertEq(name, "poppy");
        assertEq(legalNumber, keccak256(abi.encode("678843")));
        assertEq(badge, keccak256(abi.encode("ALICE1")));
        assertEq(branchId, PRECINCT2);
        assertEq(uint(employmentStatus), uint(Ledger.EmploymentStatus.ACTIVE));
        assertEq(uint(rank), uint(Ledger.Rank.DETECTIVE));

        vm.stopPrank();
    }

    //test isValidBranch

    function _hashTypedDataV4(bytes32 structHash) internal view virtual returns (bytes32) {
        return ECDSA.toTypedDataHash(ledger.DOMAIN_SEPARATOR(), structHash);
    }
}