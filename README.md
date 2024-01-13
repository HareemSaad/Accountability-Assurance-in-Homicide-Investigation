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