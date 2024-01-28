import { client } from "../../data/data";

export async function getUserDetail(address) {

  console.log("calling subgraph for: ", address);
    
    const userDetail = {
        name: "",
        badge: "",
        branchId: "",
        statecode: 0,
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
          branch {
            id
            stateCode
          }
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
        userDetail.branchId = data.officer.branch.id;
        userDetail.statecode = data.officer.branch.stateCode;
        userDetail.employmentStatus = data.officer.employmentStatus;

        return userDetail
      } catch (error) {
        console.log("error", error);
      }
  }