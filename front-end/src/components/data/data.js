import { createClient, cacheExchange, fetchExchange } from "urql";

const APIURL = "https://api.studio.thegraph.com/query/56707/fyp-aaihi/7";

export const client = createClient({
  url: APIURL,
  exchanges: [cacheExchange, fetchExchange],
});

export const employmentStatusMap = new Map();
employmentStatusMap.set("0", "Inactive") 
employmentStatusMap.set("1", "Active")
employmentStatusMap.set("2", "Retired")
employmentStatusMap.set("3", "Fired")

export const caseStatusMap = new Map();
// caseStatusMap.set("0", "NULL") 
caseStatusMap.set("1", "Open")
caseStatusMap.set("2", "Closed")
caseStatusMap.set("3", "Cold")

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

export const evidenceTypeMap = {
  0: 'WEAPON',
  1: 'PHYSICAL',
  2: 'DRUG',
  3: 'DOCUMENTARY',
  4: 'DEMONSTRATIVE',
  5: 'HEARSAY',
  6: 'MURDER_WEAPON'
}

export const participantTypeMap = {
  0: 'SUSPECT',
  1: 'WITNESS',
  2: 'PERPETRATOR',
  3: 'VICTIM'
}

export const officerTypeMap = {
  0: 'NULL',
  1: 'OFFICER',
  2: 'DETECTIVE',
  3: 'CAPTAIN'
}

export const caseStatusTypeMap = {
  0: 'NULL',
  1: 'OPEN',
  2: 'CLOSED',
  3: 'COLD'
}

export const ONBOARD_REQUEST_TYPEHASH = "0xa65232949d0eaed8dfcb6f03cec2c2ac850c9b714568c8ddfe9a736d734b3c60";
export const OFFICER_OFFBOARD_REQUEST_TYPEHASH = "0xa5de1a8881030aeaf83f1cbe710e1e505bc6db1c1348d9cfa9d4ea411590b36e";

export const TRANSFER_CAPTAIN_REQUEST_TYPEHASH = "0xa01e84747a211707abd10789c15cecc80467764e7bec52855cb2cf7bf834894c";
export const TRANSFER_CASE_REQUEST_TYPEHASH = "0xcce4632d65e5a879e32bfed8c2db9e7809fe02c694c1f1da86ee6d42cd1241d7";
export const TRANSFER_OFFICER_BRANCH_REQUEST_TYPEHASH = "0x28496ec67da6dc0ee1ee63f25e91d2ea8d8b32ddca5f51854aa43fc8b6a52177";

export const CREATE_BRANCH_REQUEST_TYPEHASH = "0x10dee30fcfda96e9c3f212db3b4a550963f852b22e449c97c7bf988eaf47b220";
export const UPDATE_BRANCH_REQUEST_TYPEHASH = "0x9ebbcd696613d6a691010a70d9b61f70fc3b74e4e16999ba3fc98c083f292c03";

export const LEDGER_DOMAIN_HASH = "0x45e020bd05818729ceab5d0142e7206b6759a84065ca69d665b4d602c621a1b0";
export const CASE_DOMAIN_HASH = "0x26966828fa35f59b212f21ce2002af22a1214cfd0fed7224f7cb9bbe57b1c445"
export const TRUSTEE_REQUEST_TYPEHASH = "0xd4bd3acb1e03e876ac88bb8ace1f77605c6cae1f2ace59109161c892048741f3"

// 0x1f27a4c30ebdfe4d5a0bb20d2a6c8681791b7470b195ab0e6ff1eabf846f607d
// 0x9ad84d0b712c25d6169be94f42e24baf7b28c0b245fa6b36d34de1bc1c7cfcd0