# Accountability-Assurance-in-Homicide-Investigation

This is the code for our project "Accountability Assurance in Homicide Investigation".

## Group Members

| Name         | Seat Number | GitHub                                                                                                                                 | LinkedIn                                                                                                                                               |
| ------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hareem Saad  | B19103019   | [![portfolio](https://img.shields.io/badge/GITHUB-000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/HareemSaad) |[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hareem-saad/) |
| Amaim Shaikh | B19103008   | [![portfolio](https://img.shields.io/badge/GITHUB-000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AmaimShaikh)|[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/amaim-shaikh/)|

## Deploy & Verify Contracts

```bash
cd back-end/contracts
source .env
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify --watch --etherscan-api-key $ETHERSCAN_API
```

For some reason above command does not automatically verify `Ledger.sol` and `Cases.sol` so we need to do it manually. get the constructor args and libraries from `broadcast/*/run-latest`

```bash

# verify ledger.sol
forge verify-contract --chain-id 11155111 0x75B2471d49FdbB456730ae630c7A19b4f9E6c6A9 src/Ledger.sol:Ledger --etherscan-api-key $ETHERSCAN_API --watch --libraries src/Libraries/CreateBranch.sol:CreateBranch:0xE68Bf65bA53BbaDc5B84b5C1895C24dcEf0a3e40 --libraries src/Libraries/UpdateBranch.sol:UpdateBranch:0x0d24a3a9dB51f0D073a7C0C9B71aff01A5B4bf05 --libraries src/Libraries/Onboard.sol:OfficerOnboard:0x7ea3b6a94C79Aa395e34C2D9e17b67a0A7Cb2627 --libraries src/Libraries/Offboard.sol:OfficerOffboard:0xAaA669b8821185d80FEE8e4072fE39E8018c26dC --libraries src/Libraries/UpdateOfficer.sol:UpdateOfficer:0x86089da9793f3ba732d44a7f6beb122aea4fa8b0 --libraries src/Libraries/TransferBranch.sol:TransferBranch:0x079e86f28e372a8d8ae8e5f9b8afccedabfdbea3 --constructor-args $(cast abi-encode "constructor(bytes32,string,uint256,uint256,address,string,bytes32,bytes32)" "0x9ad84d0b712c25d6169be94f42e24baf7b28c0b245fa6b36d34de1bc1c7cfcd0" "New York City Police Department - NYPD HQ" 5981 8888 "0x86D5cA9d24ecE1d8c35a45b83Ba15B1B9e11BD50" "Alice" "0x3938373630383600000000000000000000000000000000000000000000000000" "0x4d4f442d31000000000000000000000000000000000000000000000000000000")

```

or an easier way to just copy the libraries array from `broadcast/*/run-latest` to foundry.toml and run it with just constructor args

```bash
# verify cases.sol
forge verify-contract --chain-id 11155111 0x9AbA4B15C8Cd4Af56ef08a4349f574D479b6b966 src/Cases.sol:Cases --etherscan-api-key $ETHERSCAN_API --watch --constructor-args $(cast abi-encode "constructor(address)" "0x75B2471d49FdbB456730ae630c7A19b4f9E6c6A9")
```

## Contracts

```
Ledger: 0x20678D7ecEbB99507Bea3d0dbf3976A2BCdC68D6
Cases: 0x0C6ddc6E0da74e7493E7f0d53e06551426D9ec5f
CreateBranch: 0xe68bf65ba53bbadc5b84b5c1895c24dcef0a3e40
Evidences: 0xa1286e1e1b72ac77e0eec7ebb9315746c9e23163
OfficerOffboard: 0xaaa669b8821185d80fee8e4072fe39e8018c26dc
OfficerOnboard: 0x7ea3b6a94c79aa395e34c2d9e17b67a0a7cb2627
Participants: 0x71c82f6a9145f6099cca460a0b4f94a95b497d46
TransferBranch: 0x079e86f28e372a8d8ae8e5f9b8afccedabfdbea3
TransferCaptain: 0x3a3067670a7cdfb1627e6d6707a7c7b75c7229b7
TransferCase: 0xdad8d44c36167ac7f2bf7cecc56ea62993176cd3
TrusteeRequestLib: 0xbb17e45d9ca49f5738c58faeb3a0793c1d41b102
UpdateBranch: 0x0d24a3a9db51f0d073a7c0c9b71aff01a5b4bf05
UpdateOfficer: 0x86089da9793f3ba732d44a7f6beb122aea4fa8b0
```

## Subgraph Deployment
```
graph init --studio <SLUG> # use interactive console to add first contract
cd <SUBGRAPH_FOLDER>
graph add <CONTRACT_ADDRESS --abi <PATH_TO_ABI> --contract-name <NAME>



```