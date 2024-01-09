// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "./../src/Ledger.sol";
import "./../src/Libraries/CreateBranch.sol";
import "./../src/Libraries/UpdateBranch.sol";
import "./../src/Libraries/Onboard.sol";
import "./../src/Libraries/UpdateOfficer.sol";
import "./../src/Libraries/TransferBranch.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract BaseTest is Test {

    using CreateBranch for CreateBranch.CreateBranchVote;
    using UpdateBranch for UpdateBranch.UpdateBranchVote;
    using OfficerOnboard for OfficerOnboard.OnboardVote;
    using UpdateOfficer for UpdateOfficer.UpdateRequest;
    using TransferBranch for TransferBranch.TransferBranchRequest;

    struct Officer {
        uint256 privateKey;
        address publicKey;
        Branch branch;
        string name;
        bytes32 legalNumber;
        bytes32 badge;
        Ledger.EmploymentStatus employmentStatus;
        Ledger.Rank rank;
    }

    struct Branch {
        bytes32 branchId;
        string precinctAddress;
        uint jurisdictionArea;
        uint stateCode;
    }

    Ledger ledger;
    address ZER0_ADDRESS = address(0);
    bytes32 PRECINCT1 = keccak256(abi.encode("PRECINCT 1"));
    bytes32 PRECINCT2 = keccak256(abi.encode("PRECINCT 2"));
    bytes32 PRECINCT3 = keccak256(abi.encode("PRECINCT 3"));

    Branch branch1 = Branch(
        PRECINCT1,
        "New York City Police Department - NYPD HQ",
        5981,
        88886
    );

    Branch branch2 = Branch(
        PRECINCT2,
        "Los Angeles County Sheriff's Office - LASD HQ",
        5982,
        88887
    );

    Branch branch3 = Branch(
        PRECINCT3,
        "Chicago Police Department - CPD HQ",
        5983,
        88888
    );

    Officer moderator1 = Officer(
        0xB0B,
        vm.addr(0xB0B), //0x0376AAc07Ad725E01357B1725B5ceC61aE10473c
        branch1,
        "Bob",
        "1234",
        "MOD-1",
        Ledger.EmploymentStatus.ACTIVE,
        Ledger.Rank.MODERATOR
    );

    Officer moderator2 = Officer(
        0xABB1,
        vm.addr(0xABB1), //0x4a79fB1C667Ff8AF3e5B50925747AA39D9f74262
        branch2,
        "Abbi",
        "1235",
        "MOD-2",
        Ledger.EmploymentStatus.ACTIVE,
        Ledger.Rank.MODERATOR
    );

    Officer moderator3 = Officer(
        0xABE,
        vm.addr(0xABE),
        branch3,
        "Abe",
        "1236",
        "MOD-3",
        Ledger.EmploymentStatus.ACTIVE,
        Ledger.Rank.MODERATOR
    );

    Officer captain1 = Officer(
        0xABE1,
        vm.addr(0xABE1),
        branch1,
        "Abel",
        "1237",
        "CAP-1",
        Ledger.EmploymentStatus.ACTIVE,
        Ledger.Rank.CAPTAIN
    );

    Officer captain2 = Officer(
        0xC01E,
        vm.addr(0xC01E),
        branch2,
        "Cole",
        "1238",
        "CAP-2",
        Ledger.EmploymentStatus.ACTIVE,
        Ledger.Rank.CAPTAIN
    );

    Officer captain3 = Officer(
        0xCE11A,
        vm.addr(0xCE11A),
        branch3,
        "Celia",
        "1239",
        "CAP-3",
        Ledger.EmploymentStatus.ACTIVE,
        Ledger.Rank.CAPTAIN
    );

    Officer detective1 = Officer(
        0xB0,
        vm.addr(0xb0),
        branch1,
        "bo",
        "1247",
        "DET-1",
        Ledger.EmploymentStatus.ACTIVE,
        Ledger.Rank.DETECTIVE
    );

    Officer detective2 = Officer(
        0x1E0,
        vm.addr(0x1E0),
        branch2,
        "Leo",
        "1248",
        "DET-2",
        Ledger.EmploymentStatus.ACTIVE,
        Ledger.Rank.DETECTIVE
    );

    Officer detective3 = Officer(
        0xBE1A,
        vm.addr(0xBE1A),
        branch3,
        "Bela",
        "1249",
        "DET-3",
        Ledger.EmploymentStatus.ACTIVE,
        Ledger.Rank.DETECTIVE
    );
}