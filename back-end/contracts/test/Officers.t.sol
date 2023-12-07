// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "./../src/Officers.sol";

contract OfficersTest is Test {

    Officers officers;
    address ZER0_ADDRESS = address(0);
    bytes32 PRECINCT1 = keccak256(abi.encode("PRECINCT 1"));
    address moderator = address(1); //Bob
    address captain1 = address(2); //E11
    address captain2 = address(3);
    address detective1 = address(4); //A11CE

    function setUp() public {
        officers = new Officers(
            moderator,
            "Bob",
            keccak256(abi.encode("BOB-1")),
            PRECINCT1
        );
        testOnboardCaptainByModerator();

    }

    function testOnboardCaptainByModerator() private {
        vm.startBroadcast(moderator);
        
        officers.onboardCaptain(captain1, "E11", keccak256(abi.encode("E11-1")), PRECINCT1, Officers.Rank.CAPTAIN);

        (
            string memory name,
            bytes32 badge,
            bytes32 branchId, 
            Officers.EmploymentStatus employmentStatus, 
            Officers.Rank rank
        ) = officers.officers(captain1);

        assertEq(name, "E11");
        assertEq(badge, keccak256(abi.encode("E11-1")));
        assertEq(branchId, PRECINCT1);
        assert(employmentStatus == Officers.EmploymentStatus.ACTIVE);
        assert(rank == Officers.Rank.CAPTAIN);

        vm.stopBroadcast();
    }

    function testOnboardCaptainByCaptain() public {
        vm.startBroadcast(captain1);
        
        vm.expectRevert(InvalidRank.selector);
        officers.onboardCaptain(captain1, "E11", keccak256(abi.encode("E11-1")), PRECINCT1, Officers.Rank.CAPTAIN);

        vm.stopBroadcast();
    }

    function testOnboardCaptainUsingOnboardFunction() public {
        vm.startBroadcast(captain1);
        
        vm.expectRevert(InvalidRank.selector);
        officers.onboardCaptain(captain1, "E11", keccak256(abi.encode("E11-1")), PRECINCT1, Officers.Rank.CAPTAIN);

        vm.stopBroadcast();
    }

    function testOnboardCaptainUsingOnboardFunctionByModerator() public {
        vm.startBroadcast(moderator);
        
        vm.expectRevert(InvalidRank.selector);
        officers.onboard(captain1, "E11", keccak256(abi.encode("E11-1")), PRECINCT1, Officers.Rank.CAPTAIN);

        vm.stopBroadcast();
    }

    function testReOnboardCaptain() public {
        vm.startBroadcast(moderator);
        
        vm.expectRevert(CaptainAlreadyExists.selector);
        officers.onboardCaptain(captain1, "E11", keccak256(abi.encode("E11-1")), PRECINCT1, Officers.Rank.CAPTAIN);

        vm.stopBroadcast();
    }

    function testOnboardNewCaptainOnAnOccupiedBranch() public {
        vm.startBroadcast(moderator);
        
        vm.expectRevert(CaptainAlreadyExists.selector);
        officers.onboardCaptain(captain2, "E11", keccak256(abi.encode("E11-1")), PRECINCT1, Officers.Rank.CAPTAIN);

        vm.stopBroadcast();
    }
}