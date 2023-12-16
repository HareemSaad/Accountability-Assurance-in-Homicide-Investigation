// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "./../src/Ledger.sol";

contract OfficersTest is Test {

    Ledger ledger;
    address ZER0_ADDRESS = address(0);
    bytes32 PRECINCT1 = keccak256(abi.encode("PRECINCT 1"));
    address moderator = address(1); //Bob
    address captain1 = address(2); //E11
    address captain2 = address(3);
    address detective1 = address(4); //A11CE

    function setUp() public {
        // ledger = new Officers(
        //     moderator,
        //     "Bob",
        //     keccak256(abi.encode("BOB-1")),
        //     PRECINCT1
        // );
        // testOnboardCaptainByModerator();

    }

    function testNewBranch() public {
        vm.startPrank(moderator);

        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            88886
        );

        (
            string memory precinctAddress,
            uint jurisdictionArea,
            uint numberOfOfficers
        ) = ledger.branches(PRECINCT1);

        assertEq(precinctAddress, "5th Avenue");
        assertEq(jurisdictionArea, 88886);
        assertEq(numberOfOfficers, 0);

        vm.stopPrank();
    }

    function testDuplicateBranch() public {
        testNewBranch();

        vm.startPrank(moderator);

        vm.expectRevert(BranchAlreadyExists.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            88886
        );

        vm.stopPrank();
    }

    function testBranchIncorrectInput() public {
        vm.startPrank(moderator);

        vm.expectRevert(InvalidId.selector);
        ledger.createBranch(
            "",
            "5th Avenue",
            88886
        );

        vm.expectRevert(InvalidId.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "",
            88886
        );

        vm.expectRevert(InvalidId.selector);
        ledger.createBranch(
            "PRECINCT 1",
            "5th Avenue",
            0
        );

        vm.stopPrank();
    }
}