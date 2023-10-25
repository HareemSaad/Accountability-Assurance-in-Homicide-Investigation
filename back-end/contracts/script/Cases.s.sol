// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import "./../src/Cases.sol";

contract OfficerScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployer = vm.envUint("WALLET_KEY");
        vm.startBroadcast(deployer);
        Cases cases = new Cases(0xB2e3742819EA53147794DD1328BC261Afd04D9bB);
        cases.addCase(213);
        cases.addCase(192);
        vm.stopBroadcast();
    }
}
