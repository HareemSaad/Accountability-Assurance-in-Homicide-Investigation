import { client } from "../../data/data";

export async function getUserBranchId(address) {

    const query = `
      {
        officer(id: "${address}") {
          branch {
            id
          }
        }
      }
    `;
    try {
        const response = await client.query(query).toPromise();
        const { data  } = response;
        console.log("data", data.officer.branch.id);
        return data.officer.branch.id
    } catch (error) {
        console.log("error", error);
    }
}