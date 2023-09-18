// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import "./../src/Officers.sol";

contract OfficerScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployer = vm.envUint("WALLET_KEY");
        vm.startBroadcast(deployer);
        Officers officers = new Officers();
        officers.grantRole(officers.CAPTAIN_ROLE(), 0x86D5cA9d24ecE1d8c35a45b83Ba15B1B9e11BD50);
        vm.stopBroadcast();
    }
}
