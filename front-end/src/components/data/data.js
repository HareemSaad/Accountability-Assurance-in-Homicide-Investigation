export const employmentStatusMap = new Map();
employmentStatusMap.set("0", "Inactive")
employmentStatusMap.set("1", "Active")
employmentStatusMap.set("2", "Retired")
employmentStatusMap.set("3", "Fired")

export const rankMap = new Map();
rankMap.set("1", "Officer")
rankMap.set("2", "Detective")
rankMap.set("3", "Captain")
rankMap.set("4", "Moderator")

export const stateCodeMap = new Map();
stateCodeMap.set("1", "8888")

// Array.from(employmentStatusMap).map(([key, value]) => {
//     console.log([key, value]);
// })