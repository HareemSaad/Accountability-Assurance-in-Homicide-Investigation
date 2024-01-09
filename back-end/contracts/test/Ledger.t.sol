// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./Base.t.sol";

contract OfficersTest is BaseTest {

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
            uint(moderator3.rank)
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
            branch3.branchId
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
            branch3.branchId
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
            branch3.branchId
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
            branch3.branchId
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
            signaturesHalf,
            signers
        );

        vm.expectRevert(NotEnoughSignatures.selector);
        ledger.createBranch("PRECINCT 3",
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            1,
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
            branch3.branchId
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
            branch3.branchId
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
            uint(captain1.rank)
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
            uint(moderator2.rank)
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
            uint(detective1.rank)
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
            uint(detective1.rank)
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
            UpdateOfficer.UpdateType.ADDRESS
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator1.publicKey);

        ledger.updateAddress(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            address(99),
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
            UpdateOfficer.UpdateType.ADDRESS
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
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(OnlyModerator.selector);
        ledger.updateAddress(
            2,
            88888,
            detective1.publicKey,
            address(99),
            moderator1Signature,
            moderator1.publicKey
        );

        vm.expectRevert(InvalidSigner.selector);
        ledger.updateAddress(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            address(99),
            moderator1Signature,
            moderator2.publicKey
        );

        vm.expectRevert(ModeratorOfDifferentState.selector);
        ledger.updateAddress(
            2,
            detective1.branch.stateCode,
            detective2.publicKey,
            address(99),
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
            UpdateOfficer.UpdateType.ADDRESS
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator1.publicKey);

        ledger.updateName(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            "poppy",
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
            UpdateOfficer.UpdateType.BADGE
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
        bytes memory moderator1Signature = abi.encodePacked(r, s, v);
        
        vm.startPrank(moderator1.publicKey);

        ledger.updateBadge(
            2,
            detective1.branch.stateCode,
            detective1.publicKey,
            "DET-23",
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
            false
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
            true
        ));

        (v, r, s) = vm.sign(captain3.privateKey, _hashTypedDataV4(messageHash));
        bytes memory captain3Signature = abi.encodePacked(r, s, v);

        vm.prank(moderator1.publicKey);
        ledger.transferOfficer(
            7,
            detective1.branch.stateCode,
            detective1.publicKey,
            PRECINCT3,
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
            signatures, 
            signers
        );
        vm.stopPrank();
    }

    function addBranch3() public {
        bytes32 messageHash = CreateBranch.hash(CreateBranch.CreateBranchVote(
            1,
            branch3.precinctAddress,
            branch3.jurisdictionArea,
            branch3.stateCode,
            branch3.branchId
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
            branch2.branchId
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
            uint(moderator2.rank)
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
            uint(captain1.rank)
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
            uint(captain2.rank)
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
            uint(captain3.rank)
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
            uint(detective1.rank)
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
            uint(detective2.rank)
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(moderator1.privateKey, _hashTypedDataV4(messageHash));
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
            moderator1Signature,
            moderator1.publicKey
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
            uint(detective3.rank)
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
            moderator1Signature,
            moderator1.publicKey
        );
        
    }

    function _hashTypedDataV4(bytes32 structHash) internal view virtual returns (bytes32) {
        return ECDSA.toTypedDataHash(ledger.DOMAIN_SEPARATOR(), structHash);
    }
}

// TODO: Documentation: you can add a mod if branch does not exist so only added mods can create a branch
// TODO: mapping for legal number and badge id to check for duplicates
