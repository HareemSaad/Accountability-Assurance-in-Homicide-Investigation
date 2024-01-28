import { client } from "../../data/data";

function removeDuplicates(branchUpdates) {
  const unique = {};
  branchUpdates.forEach(item => {
    unique[item.id] = item;
  });
  return Object.values(unique);
}

export async function getBranchesAndStateCodes() {

    const query = `
    {
      branchUpdates(where: {stateCode: "8888"}) {
        id
        stateCode
        title
      }
    }
    `;
    try {
        const response = await client.query(query).toPromise();
        const { data  } = response;
        return removeDuplicates(data.branchUpdates)
    } catch (error) {
        console.log("error", error);
    }
}