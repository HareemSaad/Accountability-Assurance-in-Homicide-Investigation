import { createClient, cacheExchange, fetchExchange } from "urql";

const APIURL = "https://api.studio.thegraph.com/query/56707/fyp-aaihi/version/latest";

export const client = createClient({
  url: APIURL,
  exchanges: [cacheExchange, fetchExchange],
});

export const employmentStatusMap = new Map();
employmentStatusMap.set("0", "Inactive") 
employmentStatusMap.set("1", "Active")
employmentStatusMap.set("2", "Retired")
employmentStatusMap.set("3", "Fired")

export const rankMap = new Map();
rankMap.set(1, "Officer")
rankMap.set(2, "Detective")
rankMap.set(3, "Captain")
rankMap.set(4, "Moderator")

export const stateCodeMap = new Map();
stateCodeMap.set("8888", "8888")

export const branchIdMap = new Map();
branchIdMap.set("PRECINCT 1", "PRECINCT 1")

export const updateTypeMap = new Map();
updateTypeMap.set("0", "Address")
updateTypeMap.set("1", "Name")
updateTypeMap.set("2", "Badge")

export const ONBOARD_REQUEST_TYPEHASH = "0xa65232949d0eaed8dfcb6f03cec2c2ac850c9b714568c8ddfe9a736d734b3c60";
export const TRANSFER_CAPTAIN_REQUEST_TYPEHASH = "0xa01e84747a211707abd10789c15cecc80467764e7bec52855cb2cf7bf834894c";
export const TRANSFER_CASE_REQUEST_TYPEHASH = "0xcce4632d65e5a879e32bfed8c2db9e7809fe02c694c1f1da86ee6d42cd1241d7";
export const LEDGER_DOMAIN_HASH = "0x45e020bd05818729ceab5d0142e7206b6759a84065ca69d665b4d602c621a1b0";

// 0x1f27a4c30ebdfe4d5a0bb20d2a6c8681791b7470b195ab0e6ff1eabf846f607d
// 0x9ad84d0b712c25d6169be94f42e24baf7b28c0b245fa6b36d34de1bc1c7cfcd0