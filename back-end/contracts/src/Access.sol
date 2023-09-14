// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Access is AccessControl {

    bytes32 public constant CAPTAIN_ROLE = keccak256(abi.encodePacked("CAPTAIN_ROLE"));
    bytes32 public constant DETECTIVE_ROLE = keccak256(abi.encodePacked("DETECTIVE_ROLE"));
    bytes32 public constant OFFICER_ROLE = keccak256(abi.encodePacked("OFFICER_ROLE"));

    constructor() {
        grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setRoleAdmin(bytes32 role, bytes32 adminRole) external {
        _setRoleAdmin(role, adminRole);
    }
}
