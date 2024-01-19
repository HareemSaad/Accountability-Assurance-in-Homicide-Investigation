// // SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import "./../src/Cases.sol";
import "./../src/Ledger.sol";

contract OfficerScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployer = vm.envUint("MODERATOR_KEY");
        Ledger ledger;
        Cases cases;
        bytes32 PRECINCT1 = keccak256(abi.encode("PRECINCT 1"));
        // bytes32 PRECINCT2 = keccak256(abi.encode("PRECINCT 2"));
        // bytes32 PRECINCT3 = keccak256(abi.encode("PRECINCT 3"));

        vm.startBroadcast(deployer);

        ledger = new Ledger(
            PRECINCT1,
            "New York City Police Department - NYPD HQ",
            5981,
            8888,
            vm.addr(deployer),
            "Alice",
            keccak256(abi.encode("9876086")),
            keccak256(abi.encode("MOD-1"))
        );

        cases = new Cases(address(ledger));
        vm.stopBroadcast();
    }
}
