// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import "./../src/Officers.sol";

contract OfficerScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployer = vm.envUint("WALLET_KEY");
        vm.broadcast(deployer);
        new Officers();
    }
}
