// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

struct TrusteeRequest {
    uint caseId;
    address trustee;
    address captain;
    string branchId;
}