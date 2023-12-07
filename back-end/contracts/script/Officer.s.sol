// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import "./../src/Officers.sol";

contract OfficerScript is Script {
    bytes32 PRECINCT1 = keccak256(abi.encode("PRECINCT 1"));
    function setUp() public {}

    function run() public {
        uint256 deployer = vm.envUint("WALLET_KEY");
        vm.startBroadcast(deployer);
        Officers officers = new Officers(
            0x86D5cA9d24ecE1d8c35a45b83Ba15B1B9e11BD50,
            'Alice',
            'MOD101',
            PRECINCT1
        );
        officers.onboardCaptain(
            0x65120f1d8DD68cb2877A4dfEd1a2929809337BF0,
            'Bob',
            'CAP102',
            PRECINCT1,
            Officers.Rank.CAPTAIN
        );
        vm.stopBroadcast();
    }
}
