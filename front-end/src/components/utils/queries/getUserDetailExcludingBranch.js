import { client } from "../../data/data";

export async function getUserDetailExcludingBranch(address, branchId, statecode) {
    
    const userDetail = {
        name: "",
        badge: "",
        branchId: branchId,
        statecode: statecode,
        employmentStatus: 0,
        rank: 0
    }

    const query = `
    {
        officer(id: "${address}") {
          badge
          employmentStatus
          id
          name
          rank
        }
      }
    `;
    try {
        const response = await client.query(query).toPromise();
        const { data  } = response;
        // console.log("data", data);
        userDetail.badge = data.officer.badge;
        userDetail.name = data.officer.name;
        userDetail.rank = data.officer.rank;
        userDetail.employmentStatus = data.officer.employmentStatus;

        return userDetail
      } catch (error) {
        console.log("error", error);
      }
  }