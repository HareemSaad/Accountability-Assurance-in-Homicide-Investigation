import { client } from "../../data/data";

export async function getBranchByStateCode(stateCode) {

    const query = `
    {
      branchUpdates(where: {stateCode: "${stateCode}"}) {
        id
        stateCode
        title
      }
    }
    `;
    try {
        const response = await client.query(query).toPromise();
        const { data  } = response;
        return data.branchUpdates
    } catch (error) {
        console.log("error", error);
    }
}