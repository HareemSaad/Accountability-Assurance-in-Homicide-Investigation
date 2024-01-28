import { client } from "../../data/data";

export async function getOfficersByStateCode(statecode) {

    const query = `
    {
      officers(where: {branch_: {stateCode: "${statecode}"}, employmentStatus: 1}) {
        id
        legalNumber
        name
        rank
        employmentStatus
        badge
        branch {
          id
        }
      }
    }
    `;
    try {
        const response = await client.query(query).toPromise();
        const { data  } = response;
        console.log("data", data.officers);
        return data.officers
    } catch (error) {
        console.log("error", error);
    }
}