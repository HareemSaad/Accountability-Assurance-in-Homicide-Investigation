import { client } from "../../data/data";

function removeDuplicates(branchUpdates) {
  const unique = {};
  branchUpdates.forEach(item => {
    unique[item.stateCode] = item;
  });
  return Object.values(unique);
}

export async function getStateCodes() {

    const query = `
      {
        branchUpdates {
          stateCode
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