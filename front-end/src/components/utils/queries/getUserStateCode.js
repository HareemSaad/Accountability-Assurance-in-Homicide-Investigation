import { client } from "../../data/data";

export async function getUserStateCode(address) {

    const query = `
      {
        officer(id: "${address}") {
          branch {
            stateCode
          }
        }
      }
    `;
    try {
        const response = await client.query(query).toPromise();
        const { data  } = response;
        console.log("data", data.officer.branch.stateCode);
        return data.officer.branch.stateCode
    } catch (error) {
        console.log("error", error);
    }
}