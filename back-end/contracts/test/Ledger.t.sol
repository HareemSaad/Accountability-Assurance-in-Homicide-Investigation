// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./Base.t.sol";

contract OfficersTest is BaseTest {

    bytes32 nullBytes32;
    uint expiry = block.timestamp + 5 days;

    function setUp() public {
        ledger = new Ledger(
            branch1.branchId,
            branch1.precinctAddress,
            branch1.jurisdictionArea,
            branch1.stateCode,
            moderator1.publicKey,
            moderator1.name,
            moderator1.legalNumber,
            moderator1.badge
        );

        cases = new Cases(address(ledger));

        assertEq(ledger.moderators(moderator1.publicKey,branch1.stateCode), true);
        (
            string memory precinctAddress,
            uint jurisdictionArea,
            uint stateCode,
            uint numberOfOfficers
        ) = ledger.branches(PRECINCT1);

        assertEq(precinctAddress, branch1.precinctAddress);
        assertEq(stateCode, branch1.stateCode);
        assertEq(jurisdictionArea, branch1.jurisdictionArea);
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
            moderator3.publicKey,
            2,
            moderator3.name,
            moderator3.legalNumber,
            moderator3.badge,
            moderator3.branch.branchId,
            uint(moderator3.employmentStatus),
            uint(moderator3.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);
        ledger.addModerator(
            2,
            moderator3.branch.stateCode,
            moderator1.branch.stateCode,
            moderator3.publicKey,
            moderator3.name,
            moderator3.legalNumber,
            moderator3.badge,
            moderator3.branch.branchId,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

    } 

    function testNewBranch() public {
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            branch3.branchId,
            expiry
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator3.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator3Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator3Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator3.publicKey;
        
        vm.startPrank(moderator3.publicKey);

        ledger.createBranch(
            "PRECINCT 3",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        (
            string memory precinctAddress,
            uint jurisdictionArea,
            uint stateCode,
            uint numberOfOfficers
        ) = ledger.branches(PRECINCT3);

        assertEq(precinctAddress, branch3.precinctAddress);
        assertEq(stateCode, branch3.stateCode);
        assertEq(jurisdictionArea, branch3.jurisdictionArea);
        assertEq(numberOfOfficers, 1);

        vm.stopPrank();
    }

    function testReplayBranch() public {
        testNewBranch();
        
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            branch3.branchId,
            expiry
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator3.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator3Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator3Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator3.publicKey;
        
        vm.startPrank(moderator3.publicKey);

        vm.expectRevert(SignatureReplay.selector);

        ledger.createBranch(
            "PRECINCT 3",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        vm.stopPrank();
    }

    function testDuplicateBranch() public {
        testNewBranch();
        
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            2,
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            branch3.branchId,
            expiry
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator3.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator3Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator3Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator3.publicKey;
        
        vm.startPrank(moderator3.publicKey);

        vm.expectRevert(BranchAlreadyExists.selector);

        ledger.createBranch(
            "PRECINCT 3",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            2,
            expiry,
            signatures,
            signers
        );

        vm.stopPrank();
    }

    function testCreateBranchIncorrectInput() public {

        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            branch3.branchId,
            expiry
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator3.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator3Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator3Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator3.publicKey;

        bytes[] memory signaturesHalf = new bytes[](0);

        address[] memory signersHalf = new address[](0);
        
        vm.startPrank(moderator3.publicKey);

        vm.expectRevert(InvalidInput.selector);
        ledger.createBranch(
            "",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        vm.expectRevert(InvalidInput.selector);
        ledger.createBranch(
            "PRECINCT 3",
            "",
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        vm.expectRevert(OnlyModerator.selector);
        ledger.createBranch(
            "PRECINCT 3",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            0,
            1,
            expiry,
            signatures,
            signers
        );

        vm.expectRevert(InvalidInput.selector);
        ledger.createBranch(
            "PRECINCT 3",
            branch3.precinctAddress,
            0,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        vm.expectRevert(LengthMismatch.selector);
        ledger.createBranch(
            "PRECINCT 3",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signaturesHalf,
            signers
        );

        vm.expectRevert(NotEnoughSignatures.selector);
        ledger.createBranch("PRECINCT 3",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signaturesHalf,
            signersHalf
        );

        signers[0] = moderator1.publicKey;

        vm.expectRevert(InvalidSignature.selector);
        ledger.createBranch(
            "PRECINCT 3",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );


        vm.expectRevert(InvalidSignature.selector);
        ledger.createBranch(
            "PRECINCT 3",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            0,
            expiry,
            signatures,
            signers
        );

        vm.warp(expiry + 1 days);
        vm.expectRevert(Expired.selector);
        ledger.createBranch(
            "",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
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
            branch3.jurisdictionArea,
            branch3.stateCode,
            branch3.branchId,
            expiry
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator3.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator3Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator3Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator3.publicKey;
        
        vm.startPrank(moderator3.publicKey);

        ledger.updateBranch(
            "PRECINCT 3",
            "6th Avenue",
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        (
            string memory precinctAddress,
            uint jurisdictionArea,
            uint stateCode,
            uint numberOfOfficers
        ) = ledger.branches(PRECINCT3);

        assertEq(precinctAddress, "6th Avenue");
        assertEq(stateCode, branch3.stateCode);
        assertEq(jurisdictionArea, branch3.jurisdictionArea);
        assertEq(numberOfOfficers, 1);

        vm.stopPrank();
    }

    function testUpdateBranchIncorrectInput() public {

        testNewBranch();
        
        bytes32 messageHash = UpdateBranch.hash(UpdateBranch.UpdateBranchVote(
            1,
            "6th Avenue",
            branch3.jurisdictionArea,
            branch3.stateCode,
            branch3.branchId,
            expiry
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator3.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator3Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator3Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator3.publicKey;

        bytes[] memory signaturesHalf = new bytes[](0);

        address[] memory signersHalf = new address[](0);
        
        vm.startPrank(moderator3.publicKey);

        vm.expectRevert(InvalidInput.selector);
        ledger.updateBranch(
            "",
            "6th Avenue",
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        vm.expectRevert(InvalidInput.selector);
        ledger.updateBranch(
            "PRECINCT 3",
            "",
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        vm.expectRevert(OnlyModerator.selector);
        ledger.updateBranch(
            "PRECINCT 3",
            "6th Avenue",
            branch3.jurisdictionArea,
            0,
            1,
            expiry,
            signatures,
            signers
        );

        vm.expectRevert(InvalidInput.selector);
        ledger.updateBranch(
            "PRECINCT 3",
            "6th Avenue",
            0,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        vm.expectRevert(LengthMismatch.selector);
        ledger.updateBranch(
            "PRECINCT 3",
            "6th Avenue",
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signaturesHalf,
            signers
        );

        vm.expectRevert(NotEnoughSignatures.selector);
        ledger.updateBranch(
            "PRECINCT 3",
            "6th Avenue",
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signaturesHalf,
            signersHalf
        );

        signers[0] = moderator1.publicKey;

        vm.expectRevert(InvalidSignature.selector);
        ledger.updateBranch(
            "PRECINCT 3",
            "6th Avenue",
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        vm.expectRevert(OnlyModerator.selector);
        ledger.updateBranch(
            "PRECINCT 3",
            "6th Avenue",
            123456,
            88886,
            0,
            expiry,
            signatures,
            signers
        );

        vm.stopPrank();
    }

    function testCaptainOnboard() public {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            captain1.publicKey,
            2,
            captain1.name,
            captain1.legalNumber,
            captain1.badge,
            captain1.branch.branchId,
            uint(captain1.employmentStatus),
            uint(captain1.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);

        ledger.onboardCaptain(
            2,
            captain1.branch.stateCode,
            captain1.publicKey,
            captain1.name,
            captain1.legalNumber,
            captain1.badge,
            captain1.branch.branchId,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(captain1.publicKey);

        assertEq(name, captain1.name);
        assertEq(legalNumber, captain1.legalNumber);
        assertEq(badge, captain1.badge);
        assertEq(branchId, captain1.branch.branchId);
        assertEq(uint(employmentStatus), uint(captain1.employmentStatus));
        assertEq(uint(rank), uint(captain1.rank));

        assertTrue(ledger.legalNumber(captain1.legalNumber));
        assertTrue(ledger.badge(captain1.badge));

        vm.stopPrank();
    }

    function testModeratorOnboard() public {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            moderator2.publicKey,
            2,
            moderator2.name,
            moderator2.legalNumber,
            moderator2.badge,
            moderator2.branch.branchId,
            uint(moderator2.employmentStatus),
            uint(moderator2.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);

        ledger.addModerator(
            2,
            moderator2.branch.stateCode,
            moderator1.branch.stateCode,
            moderator2.publicKey,
            moderator2.name,
            moderator2.legalNumber,
            moderator2.badge,
            moderator2.branch.branchId,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(moderator1.publicKey);

        assertEq(name, moderator1.name);
        assertEq(legalNumber, moderator1.legalNumber);
        assertEq(badge, moderator1.badge);
        assertEq(branchId, moderator1.branch.branchId);
        assertEq(uint(employmentStatus), uint(moderator1.employmentStatus));
        assertEq(uint(rank), uint(moderator1.rank));

        assertTrue(ledger.legalNumber(moderator1.legalNumber));
        assertTrue(ledger.badge(moderator1.badge));

        vm.stopPrank();
    }

    function testOnboard() public {
        testCaptainOnboard();
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            detective1.publicKey,
            2,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            uint(detective1.employmentStatus),
            uint(detective1.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(captain1.publicKey);

        ledger.onboard(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(detective1.publicKey);

        assertEq(name, detective1.name);
        assertEq(legalNumber, detective1.legalNumber);
        assertEq(badge, detective1.badge);
        assertEq(branchId, detective1.branch.branchId);
        assertEq(uint(employmentStatus), uint(detective1.employmentStatus));
        assertEq(uint(rank), uint(detective1.rank));

        assertTrue(ledger.legalNumber(detective1.legalNumber));
        assertTrue(ledger.badge(detective1.badge));

        vm.stopPrank();
    }

    function testOnboardInput() public {
        testCaptainOnboard();
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            detective1.publicKey,
            2,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            uint(detective1.employmentStatus),
            uint(detective1.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.startPrank(captain1.publicKey);

        vm.expectRevert(InvalidRank.selector);
        ledger.onboard(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            Ledger.Rank.CAPTAIN,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(InvalidRank.selector);
        ledger.onboard(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            Ledger.Rank.NULL,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(InvalidAddress.selector);
        ledger.onboard(
            2,
            detective1.branch.stateCode,
            address(0),
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(InvalidString.selector);
        ledger.onboard(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            "",
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(InvalidBadge.selector);
        ledger.onboard(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            keccak256(abi.encode("")),
            detective1.branch.branchId,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(BranchDoesNotExists.selector);
        ledger.onboard(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            PRECINCT2,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(InvalidLegalNumber.selector);
        ledger.onboard(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            keccak256(abi.encode("")),
            detective1.badge,
            detective1.branch.branchId,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(ModeratorOfDifferentState.selector);
        ledger.onboard(
            2,
            88882,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(BranchDoesNotExists.selector);
        ledger.onboard(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            PRECINCT3,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(InvalidSigner.selector);
        ledger.onboard(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator2.publicKey
        );

        vm.expectRevert(InvalidSignature.selector);
        ledger.onboard(
            1,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
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
        ) = ledger.officers(detective1.publicKey);

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            address(99),
            2,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            uint(detective1.rank), 
            UpdateOfficer.UpdateType.ADDRESS,
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator1.publicKey);

        ledger.updateAddress(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            address(99),
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            name,
            legalNumber,
            badge,
            branchId,
            employmentStatus,
            rank
        ) = ledger.officers(address(99));

        assertEq(name, detective1.name);
        assertEq(legalNumber,detective1.legalNumber);
        assertEq(badge, detective1.badge);
        assertEq(branchId, detective1.branch.branchId);
        assertEq(uint(employmentStatus), uint(detective1.employmentStatus));
        assertEq(uint(rank), uint(detective1.rank));

        vm.stopPrank();
    }

    function testUpdateAddressIncorrectInput() public {
        testOnboard();
        
        // (
        //     string memory name,
        //     bytes32 legalNumber,
        //     bytes32 badge,
        //     bytes32 branchId,
        //     Ledger.EmploymentStatus employmentStatus,
        //     Ledger.Rank rank
        // ) = ledger.officers(detective1.publicKey);

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            address(99),
            2,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            uint(detective1.rank), 
            UpdateOfficer.UpdateType.ADDRESS,
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator1.publicKey);

        vm.expectRevert(ZeroAddress.selector);
        ledger.updateAddress(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            address(0),
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(OnlyModerator.selector);
        ledger.updateAddress(
            2,
            88888,
            detective1.publicKey,
            address(99),
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(InvalidSigner.selector);
        ledger.updateAddress(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            address(99),
            expiry,
            moderator1Signature,
            moderator2.publicKey
        );

        vm.expectRevert(ModeratorOfDifferentState.selector);
        ledger.updateAddress(
            2,
            detective1.branch.stateCode,
            detective2.publicKey,
            address(99),
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.stopPrank();

        vm.prank(moderator3.publicKey);
        vm.expectRevert(OnlyModerator.selector);
        ledger.updateAddress(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            address(99),
            expiry,
            moderator1Signature,
            moderator1.publicKey
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
        ) = ledger.officers(detective1.publicKey);

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            detective1.publicKey,
            2,
            "poppy",
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            uint(detective1.rank), 
            UpdateOfficer.UpdateType.ADDRESS,
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator1.publicKey);

        ledger.updateName(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            "poppy",
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            name,
            legalNumber,
            badge,
            branchId,
            employmentStatus,
            rank
        ) = ledger.officers(detective1.publicKey);

        assertEq(name, "poppy");
        assertEq(legalNumber, detective1.legalNumber);
        assertEq(badge, detective1.badge);
        assertEq(branchId, detective1.branch.branchId);
        assertEq(uint(employmentStatus), uint(detective1.employmentStatus));
        assertEq(uint(rank), uint(detective1.rank));

        vm.stopPrank();
    }

    function testUpdateBadge() public {
        testOnboard();
        
        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(detective1.publicKey);

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            detective1.publicKey,
            2,
            detective1.name,
            detective1.legalNumber,
            "DET-23",
            detective1.branch.branchId,
            uint(detective1.rank), 
            UpdateOfficer.UpdateType.BADGE,
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator1.publicKey);

        ledger.updateBadge(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            "DET-23",
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            name,
            legalNumber,
            badge,
            branchId,
            employmentStatus,
            rank
        ) = ledger.officers(detective1.publicKey);

        assertEq(name, detective1.name);
        assertEq(legalNumber, detective1.legalNumber);
        assertEq(badge, "DET-23");
        assertEq(branchId, detective1.branch.branchId);
        assertEq(uint(employmentStatus), uint(detective1.employmentStatus));
        assertEq(uint(rank), uint(detective1.rank));


        assertTrue(ledger.badge("DET-23"));
        assertFalse(ledger.badge(detective1.badge));

        vm.stopPrank();
    }

    function testUpdateBadgeDuplicate() public {
        testUpdateBadge();
        
        // (
        //     string memory name,
        //     bytes32 legalNumber,
        //     bytes32 badge,
        //     bytes32 branchId,
        //     Ledger.EmploymentStatus employmentStatus,
        //     Ledger.Rank rank
        // ) = ledger.officers(detective1.publicKey);

        bytes32 messageHash = UpdateOfficer.hash(UpdateOfficer.UpdateRequest(
            detective1.publicKey,
            2,
            detective1.name,
            detective1.legalNumber,
            "DET-23",
            detective1.branch.branchId,
            uint(detective1.rank), 
            UpdateOfficer.UpdateType.BADGE,
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator1.publicKey);
        vm.expectRevert(InvalidBadge.selector);
        ledger.updateBadge(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            "DET-23",
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        vm.stopPrank();
    }

    function testSuccessfulPromotion() public {
        testOnboard();

        // Promote the officer
        vm.startPrank(moderator1.publicKey);
        ledger.promote(
            detective1.branch.stateCode, 
            detective1.publicKey, 
            Ledger.Rank.CAPTAIN
        );
        vm.stopPrank();

        // Check the officer's new rank
        (,,,,,Ledger.Rank rank) = ledger.officers(detective1.publicKey);
        assertEq(uint(rank), uint(Ledger.Rank.CAPTAIN)); // Assuming the officer was initially at Rank.OFFICER
    }

    function testPromotionByNonModerator() public {
        // Attempt to promote the officer by a non-moderator
        vm.startPrank(captain1.publicKey);
        vm.expectRevert(OnlyModerator.selector);
        ledger.promote(
            detective1.branch.stateCode, 
            detective1.publicKey, 
            Ledger.Rank.CAPTAIN
        );
        vm.stopPrank();
    }

    function testPromotionDifferentStateCode() public {
        testOnboard();

        // Attempt to promote an officer with a different state code
        vm.startPrank(moderator3.publicKey);
        vm.expectRevert(ModeratorOfDifferentState.selector);
        ledger.promote(
            88888, 
            detective1.publicKey, 
            Ledger.Rank.CAPTAIN
        );
        vm.stopPrank();
    }

    function testPromotionToInvalidRank() public {
        testOnboard();

        // Attempt to promote a moderator (which should fail)
        vm.startPrank(moderator1.publicKey);
        vm.expectRevert(InvalidRank.selector);
        ledger.promote(
            detective1.branch.stateCode, 
            detective1.publicKey, 
            Ledger.Rank.DETECTIVE
        );
        vm.expectRevert(InvalidRank.selector);
        ledger.promote(
            detective1.branch.stateCode, 
            detective1.publicKey, 
            Ledger.Rank.NULL
        );
        vm.stopPrank();
    }

    function testTransferBranch() public {
        addBranch3();
        addCaptain1();
        addCaptain3();
        addDetective1();

        bytes32 messageHash = TransferBranch.hash(TransferBranch.TransferBranchRequest(
            detective1.publicKey,
            7,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            branch3.branchId,
            uint(detective1.employmentStatus),
            uint(detective1.rank),
            false,
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(captain1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory captain1Signature = abi.encodePacked(r, s, v);

        messageHash = TransferBranch.hash(TransferBranch.TransferBranchRequest(
            detective1.publicKey,
            7,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            branch3.branchId,
            uint(detective1.employmentStatus),
            uint(detective1.rank),
            true,
            expiry
        ));

        (v, r, s) = vm.sign(captain3.privateKey, _hashTypedDataV4(messageHash));
        bytes memory captain3Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);
        ledger.transferOfficer(
            7,
            detective1.branch.stateCode,
            detective1.publicKey,
            PRECINCT3,
            expiry,
            [captain1Signature, captain3Signature],
            [captain1.publicKey, captain3.publicKey]
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(detective1.publicKey);

        assertEq(name, detective1.name);
        assertEq(legalNumber, detective1.legalNumber);
        assertEq(badge, detective1.badge);
        assertEq(branchId, branch3.branchId);
        assertEq(uint(employmentStatus), uint(detective1.employmentStatus));
        assertEq(uint(rank), uint(detective1.rank));

        // (
        //     ,,,
        //     uint numberOfOfficers
        // ) = ledger.branches(PRECINCT3);

        // assertEq(numberOfOfficers, 1);

        // (
        //     ,,,
        //     numberOfOfficers
        // ) = ledger.branches(PRECINCT1);

        // assertEq(numberOfOfficers, 1);

    }
    
    function testTransferOfficerByNonModerator() public {
        addBranch3();
        addCaptain1();
        addDetective1();

        bytes[2] memory signatures;
        address[2] memory signers = [captain1.publicKey, captain1.publicKey]; // Dummy signers

        vm.startPrank(detective1.publicKey); // Non-moderator
        vm.expectRevert(OnlyModerator.selector);
        ledger.transferOfficer(
            1, 
            detective1.branch.stateCode, 
            detective1.publicKey, 
            PRECINCT3, 
            expiry,
            signatures, 
            signers
        );
        vm.stopPrank();
    }

    function testTransferOfficerInconsistentStateCode() public {
        addBranch3();
        addCaptain1();
        addDetective1();

        bytes[2] memory signatures;
        address[2] memory signers = [captain1.publicKey, captain1.publicKey]; // Dummy signers

        vm.startPrank(moderator3.publicKey);
        vm.expectRevert(ModeratorOfDifferentState.selector);
        ledger.transferOfficer(
            1, 
            branch3.stateCode, // Incorrect state code 
            detective1.publicKey, 
            PRECINCT3, 
            expiry,
            signatures, 
            signers
        );
        vm.stopPrank();
    }

    function testTransferOfficerSignersNotCaptains() public {
        addBranch3();
        addCaptain1();
        addCaptain3();
        addDetective1();

        bytes[2] memory signatures; // Dummy signatures
        address[2] memory signers = [detective1.publicKey, detective2.publicKey]; // Detectives, not captains

        vm.startPrank(moderator1.publicKey);
        vm.expectRevert(SignerNotCaptain.selector);
        ledger.transferOfficer(
            1, 
            detective1.branch.stateCode, 
            detective1.publicKey, 
            PRECINCT3, 
            expiry,
            signatures, 
            signers
        );
        vm.stopPrank();
    }

    function testTransferOfficerInvalidBranch() public {
        addModerator2();
        addBranch3();
        addBranch2();
        addCaptain1();
        addCaptain2();
        addCaptain3();
        addDetective1();

        bytes[2] memory signatures; // Dummy signatures
        address[2] memory signers = [captain2.publicKey, captain3.publicKey];

        vm.startPrank(moderator1.publicKey);
        vm.expectRevert(InvalidBranch.selector);
        ledger.transferOfficer(
            1, 
            detective1.branch.stateCode, 
            detective1.publicKey, 
            PRECINCT3, 
            expiry,
            signatures, 
            signers
        );

        signers = [captain1.publicKey, captain2.publicKey];
        vm.expectRevert(InvalidBranch.selector);
        ledger.transferOfficer(
            1, 
            detective1.branch.stateCode, 
            detective1.publicKey, 
            PRECINCT3, 
            expiry,
            signatures, 
            signers
        );

        signers = [captain2.publicKey, captain2.publicKey];
        vm.expectRevert(InvalidBranch.selector);
        ledger.transferOfficer(
            1, 
            detective1.branch.stateCode, 
            detective1.publicKey, 
            PRECINCT3, 
            expiry,
            signatures, 
            signers
        );
        vm.stopPrank();
    }

    function testOffboard() public {
        testOnboard();

        bytes32 messageHash = OfficerOffboard.hash(OfficerOffboard.OffboardVote(
            detective1.publicKey,
            2,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            uint(Ledger.EmploymentStatus.INACTIVE),
            uint(detective1.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);
        ledger.offboard(
            2,
            detective1.publicKey,
            detective1.branch.stateCode,
            detective1.branch.branchId,
            Ledger.EmploymentStatus.INACTIVE,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(detective1.publicKey);

        assertEq(name, detective1.name);
        assertEq(legalNumber, detective1.legalNumber);
        assertEq(badge, nullBytes32);
        assertEq(branchId, nullBytes32);
        assertEq(uint(employmentStatus), uint(Ledger.EmploymentStatus.INACTIVE));
        assertEq(uint(rank), 0);

        assertFalse(ledger.badge(detective1.badge));

        vm.stopPrank();
    }

    function testOffboardCaptain() public {
        testOnboard();

        bytes32 messageHash = OfficerOffboard.hash(OfficerOffboard.OffboardVote(
            captain1.publicKey,
            2,
            captain1.name,
            captain1.legalNumber,
            captain1.badge,
            captain1.branch.branchId,
            uint(Ledger.EmploymentStatus.FIRED),
            uint(captain1.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);
        ledger.offboardCaptain(
            2,
            captain1.publicKey,
            captain1.branch.stateCode,
            captain1.branch.branchId,
            Ledger.EmploymentStatus.FIRED,
            captain1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(captain1.publicKey);

        assertEq(name, captain1.name);
        assertEq(legalNumber, captain1.legalNumber);
        assertEq(badge, nullBytes32);
        assertEq(branchId, nullBytes32);
        assertEq(uint(employmentStatus), uint(Ledger.EmploymentStatus.FIRED));
        assertEq(uint(rank), 0);

        assertFalse(ledger.badge(captain1.badge));

        vm.stopPrank();
    }

    function testOffboardModerators() public {
        testOnboard();
        addModerator4();

        bytes32 messageHash = OfficerOffboard.hash(OfficerOffboard.OffboardVote(
            moderator4.publicKey,
            2,
            moderator4.name,
            moderator4.legalNumber,
            moderator4.badge,
            moderator4.branch.branchId,
            uint(Ledger.EmploymentStatus.RETIRED),
            uint(moderator4.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);
        ledger.offboardModerator(
            2,
            moderator4.publicKey,
            moderator4.branch.stateCode,
            moderator4.branch.branchId,
            Ledger.EmploymentStatus.RETIRED,
            moderator4.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(moderator4.publicKey);

        assertEq(name, moderator4.name);
        assertEq(legalNumber, moderator4.legalNumber);
        assertEq(badge, nullBytes32);
        assertEq(branchId, nullBytes32);
        assertEq(uint(employmentStatus), uint(Ledger.EmploymentStatus.RETIRED));
        assertEq(uint(rank), 0);

        assertFalse(ledger.badge(moderator4.badge));
        assertFalse(ledger.moderators(moderator4.publicKey, moderator4.branch.stateCode));
        assertEq(ledger.moderatorCount(moderator4.branch.stateCode), 1);

        vm.stopPrank();
    }

    function testOffboardLastModerator() public {
        testOnboard();

        bytes32 messageHash = OfficerOffboard.hash(OfficerOffboard.OffboardVote(
            moderator1.publicKey,
            2,
            moderator1.name,
            moderator1.legalNumber,
            moderator1.badge,
            moderator1.branch.branchId,
            uint(Ledger.EmploymentStatus.INACTIVE),
            uint(moderator1.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);
        vm.expectRevert(StateNeedsAtleastOneModerator.selector);
        ledger.offboardModerator(
            2,
            moderator1.publicKey,
            moderator1.branch.stateCode,
            moderator1.branch.branchId,
            Ledger.EmploymentStatus.INACTIVE,
            moderator1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(moderator1.publicKey);

        assertEq(name, moderator1.name);
        assertEq(legalNumber, moderator1.legalNumber);
        assertEq(badge, moderator1.badge);
        assertEq(branchId, moderator1.branch.branchId);
        assertEq(uint(employmentStatus), uint(moderator1.employmentStatus));
        assertEq(uint(rank), uint(moderator1.rank));

        assertTrue(ledger.badge(moderator1.badge));

        vm.stopPrank();
    }

    function testRehire() public {
        testOffboard();
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            detective1.publicKey,
            3,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            uint(detective1.employmentStatus),
            uint(detective1.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(captain1.publicKey);

        ledger.onboard(
            3,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );

        (
            string memory name,
            bytes32 legalNumber,
            bytes32 badge,
            bytes32 branchId,
            Ledger.EmploymentStatus employmentStatus,
            Ledger.Rank rank
        ) = ledger.officers(detective1.publicKey);

        assertEq(name, detective1.name);
        assertEq(legalNumber, detective1.legalNumber);
        assertEq(badge, detective1.badge);
        assertEq(branchId, detective1.branch.branchId);
        assertEq(uint(employmentStatus), uint(detective1.employmentStatus));
        assertEq(uint(rank), uint(detective1.rank));

        assertTrue(ledger.legalNumber(detective1.legalNumber));
        assertTrue(ledger.badge(detective1.badge));

        vm.stopPrank();
    }

    function testAddCase() public {
        addCaptain1();

        vm.expectRevert(InvalidBranch.selector);
        vm.prank(captain1.publicKey);
        cases.addCase(
            213,
            captain3.branch.branchId
        );

        vm.prank(captain1.publicKey);
        cases.addCase(
            213,
            captain1.branch.branchId
        );

        (Cases.CaseStatus status, bytes32 branch) = cases._case(213);

        assertEq(uint(status), uint(Cases.CaseStatus.OPEN));
        assertEq(branch, captain1.branch.branchId);
        assertTrue(cases.officerInCase(213, captain1.publicKey));

        vm.expectRevert(InvalidCase.selector);
        vm.prank(captain1.publicKey);
        cases.addCase(
            213,
            captain1.branch.branchId
        );

    }

    function testUpdateCaseStatus() public {
        testAddCase();

        vm.expectRevert(InvalidCase.selector);
        vm.prank(captain1.publicKey);
        cases.updateCaseStatus(
            2013,
            Cases.CaseStatus.NULL
        );

        vm.expectRevert(InvalidRank.selector);
        cases.updateCaseStatus(
            213,
            Cases.CaseStatus.CLOSED
        );

        vm.prank(captain1.publicKey);
        cases.updateCaseStatus(
            213,
            Cases.CaseStatus.CLOSED
        );

        (Cases.CaseStatus status, bytes32 branch) = cases._case(213);

        assertEq(uint(status), uint(Cases.CaseStatus.CLOSED));
        assertEq(branch, captain1.branch.branchId);
        assertTrue(cases.officerInCase(213, captain1.publicKey));
    }

    function testAddOfficerInCase() public {
        testAddCase();

        vm.expectRevert(InvalidOfficer.selector);
        vm.prank(captain1.publicKey);
        cases.addOfficerInCase(
            213,
            detective1.publicKey
        );

        addDetective1();
        addModerator2();
        addBranch2();
        addCaptain2();
        addDetective2();

        vm.expectRevert(BranchMismatch.selector);
        vm.prank(captain1.publicKey);
        cases.addOfficerInCase(
            213,
            detective2.publicKey
        );

        vm.expectRevert(InvalidCase.selector);
        vm.prank(captain1.publicKey);
        cases.addOfficerInCase(
            2013,
            detective1.publicKey
        );

        vm.expectRevert(InvalidRank.selector);
        cases.addOfficerInCase(
            213,
            detective1.publicKey
        );

        vm.prank(captain1.publicKey);
        cases.addOfficerInCase(
            213,
            detective1.publicKey
        );

        (Cases.CaseStatus status, bytes32 branch) = cases._case(213);

        assertEq(uint(status), uint(Cases.CaseStatus.OPEN));
        assertEq(branch, captain1.branch.branchId);
        assertTrue(cases.officerInCase(213, captain1.publicKey));
        assertTrue(cases.officerInCase(213, detective1.publicKey));
    }

    function testRemoveOfficerInCase() public {
        testAddOfficerInCase();

        vm.expectRevert(InvalidOfficer.selector);
        vm.prank(captain1.publicKey);
        cases.removeOfficerInCase(
            213,
            detective2.publicKey
        );

        vm.expectRevert(InvalidRank.selector);
        cases.removeOfficerInCase(
            213,
            detective1.publicKey
        );

        vm.prank(captain1.publicKey);
        cases.removeOfficerInCase(
            213,
            detective1.publicKey
        );

        (Cases.CaseStatus status, bytes32 branch) = cases._case(213);

        assertEq(uint(status), uint(Cases.CaseStatus.OPEN));
        assertEq(branch, captain1.branch.branchId);
        assertTrue(cases.officerInCase(213, captain1.publicKey));
        assertFalse(cases.officerInCase(213, detective1.publicKey));
    }

    function testAddParticipant() public {
        testAddOfficerInCase();

        vm.expectRevert(InvalidOfficer.selector);
        vm.prank(detective2.publicKey);
        cases.addParticipant(
            213,
            Participants.Participant(
                322,
                Participants.ParticipantCategory.SUSPECT,
                "Data",
                false
            )
        );

        vm.expectRevert(InvalidOfficer.selector);
        vm.prank(detective1.publicKey);
        cases.addParticipant(
            2113,
            Participants.Participant(
                321,
                Participants.ParticipantCategory.SUSPECT,
                "Something something",
                false
            )
        );

        vm.expectRevert(CannotBePreApproved.selector);
        vm.prank(detective1.publicKey);
        cases.addParticipant(
            213,
            Participants.Participant(
                321,
                Participants.ParticipantCategory.SUSPECT,
                "Something something",
                true
            )
        );

        vm.prank(detective1.publicKey);
        cases.addParticipant(
            213,
            Participants.Participant(
                321,
                Participants.ParticipantCategory.SUSPECT,
                "Something something",
                false
            )
        );

        Participants.Participant memory participant = cases.participantInCase(213, 321);

        assertEq(participant.participantId, 321);
        assertEq(uint(participant.category), uint(Participants.ParticipantCategory.SUSPECT));
        assertEq(participant.data, bytes("Something something"));
        assertFalse(participant.approved);
    }

    function testApproveParticipant() public {
        testAddParticipant();

        vm.expectRevert(InvalidOfficer.selector);
        vm.prank(captain1.publicKey);
        cases.approveParticipant(
            2135,
            321
        );

        vm.prank(captain1.publicKey);
        cases.approveParticipant(
            213,
            321
        );

        Participants.Participant memory participant = cases.participantInCase(213, 321);

        assertEq(participant.participantId, 321);
        assertEq(uint(participant.category), uint(Participants.ParticipantCategory.SUSPECT));
        assertEq(participant.data, bytes("Something something"));
        assertTrue(participant.approved);

        vm.expectRevert(AlreadyApproved.selector);
        vm.prank(captain1.publicKey);
        cases.approveParticipant(
            213,
            321
        );
    }

    function addBranch3() public {
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            branch3.branchId,
            expiry
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator3.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator3Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator3Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator3.publicKey;
        
        vm.startPrank(moderator3.publicKey);

        ledger.createBranch(
            "PRECINCT 3",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        vm.stopPrank();
    }

    function addBranch2() public {
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            branch2.precinctAddress,
            branch2.jurisdictionArea,
            branch2.stateCode,
            branch2.branchId,
            expiry
        ));

        bytes[] memory signatures = new bytes[](1);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator2.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator3Signature = abi.encodePacked(r, s, v);

        signatures[0] = moderator3Signature;

        address[] memory signers = new address[](1);

        signers[0] = moderator2.publicKey;
        
        vm.startPrank(moderator2.publicKey);

        ledger.createBranch(
            "PRECINCT 2",
            branch2.precinctAddress,
            branch2.jurisdictionArea,
            branch2.stateCode,
            1,
            expiry,
            signatures,
            signers
        );

        vm.stopPrank();
    }

    function addModerator2() private {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            moderator2.publicKey,
            2,
            moderator2.name,
            moderator2.legalNumber,
            moderator2.badge,
            moderator2.branch.branchId,
            uint(moderator2.employmentStatus),
            uint(moderator2.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);
        ledger.addModerator(
            2,
            moderator2.branch.stateCode,
            moderator1.branch.stateCode,
            moderator2.publicKey,
            moderator2.name,
            moderator2.legalNumber,
            moderator2.badge,
            moderator2.branch.branchId,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );
    }

    function addModerator4() private {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            moderator4.publicKey,
            2,
            moderator4.name,
            moderator4.legalNumber,
            moderator4.badge,
            moderator4.branch.branchId,
            uint(moderator4.employmentStatus),
            uint(moderator4.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);
        ledger.addModerator(
            2,
            moderator4.branch.stateCode,
            moderator1.branch.stateCode,
            moderator4.publicKey,
            moderator4.name,
            moderator4.legalNumber,
            moderator4.badge,
            moderator4.branch.branchId,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );
    }

    function addCaptain1() private {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            captain1.publicKey,
            2,
            captain1.name,
            captain1.legalNumber,
            captain1.badge,
            captain1.branch.branchId,
            uint(captain1.employmentStatus),
            uint(captain1.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);

        ledger.onboardCaptain(
            2,
            captain1.branch.stateCode,
            captain1.publicKey,
            captain1.name,
            captain1.legalNumber,
            captain1.badge,
            captain1.branch.branchId,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );
    }

    function addCaptain2() private {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            captain2.publicKey,
            2,
            captain2.name,
            captain2.legalNumber,
            captain2.badge,
            captain2.branch.branchId,
            uint(captain2.employmentStatus),
            uint(captain2.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator2.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator2Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator2.publicKey);

        ledger.onboardCaptain(
            2,
            captain2.branch.stateCode,
            captain2.publicKey,
            captain2.name,
            captain2.legalNumber,
            captain2.badge,
            captain2.branch.branchId,
            expiry,
            moderator2Signature,
            moderator2.publicKey
        );
    }

    function addCaptain3() private {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            captain3.publicKey,
            2,
            captain3.name,
            captain3.legalNumber,
            captain3.badge,
            captain3.branch.branchId,
            uint(captain3.employmentStatus),
            uint(captain3.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator3.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator3.publicKey);

        ledger.onboardCaptain(
            2,
            captain3.branch.stateCode,
            captain3.publicKey,
            captain3.name,
            captain3.legalNumber,
            captain3.badge,
            captain3.branch.branchId,
            expiry,
            moderator1Signature,
            moderator3.publicKey
        );
    }

    function addDetective1() private {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            detective1.publicKey,
            2,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            uint(detective1.employmentStatus),
            uint(detective1.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(captain1.publicKey);

        ledger.onboard(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            detective1.name,
            detective1.legalNumber,
            detective1.badge,
            detective1.branch.branchId,
            detective1.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );
        
    }

    function addDetective2() private {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            detective2.publicKey,
            2,
            detective2.name,
            detective2.legalNumber,
            detective2.badge,
            detective2.branch.branchId,
            uint(detective2.employmentStatus),
            uint(detective2.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator2.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(captain2.publicKey);

        ledger.onboard(
            2,
            detective2.branch.stateCode,
            detective2.publicKey,
            detective2.name,
            detective2.legalNumber,
            detective2.badge,
            detective2.branch.branchId,
            detective2.rank,
            expiry,
            moderator1Signature,
            moderator2.publicKey
        );
        
    }

    function addDetective3() private {
        bytes32 messageHash = OfficerOnboard.hash(OfficerOnboard.OnboardVote(
            detective3.publicKey,
            2,
            detective3.name,
            detective3.legalNumber,
            detective3.badge,
            detective3.branch.branchId,
            uint(detective3.employmentStatus),
            uint(detective3.rank),
            expiry
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);

        vm.prank(captain3.publicKey);

        ledger.onboard(
            2,
            detective3.branch.stateCode,
            detective3.publicKey,
            detective3.name,
            detective3.legalNumber,
            detective3.badge,
            detective3.branch.branchId,
            detective3.rank,
            expiry,
            moderator1Signature,
            moderator1.publicKey
        );
        
    }

    function _hashTypedDataV4(bytes32 structHash) internal view virtual returns (bytes32) {
        return ECDSA.toTypedDataHash(ledger.DOMAIN_SEPARATOR(), structHash);
    }
}
