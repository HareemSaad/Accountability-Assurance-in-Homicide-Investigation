// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

library TrusteeRequestLib {

    struct TrusteeRequest {
        uint caseId;
        address trustee;
        address captain;
        bytes32 branchId;
    }

    bytes32 public constant REQUEST_TYPE_HASH =
    keccak256(
        "TrusteeRequest("
        "uint caseId,"
        "address trustee,"
        "address captain,"
        "bytes32 branchId,"
        ")"
    );

    function hash(TrusteeRequest calldata request) public pure returns (bytes32) {
        return (
            keccak256(
                abi.encode(
                    REQUEST_TYPE_HASH,
                    request.caseId,
                    request.trustee,
                    request.captain,
                    request.branchId
                )
            )
        );
    }

}