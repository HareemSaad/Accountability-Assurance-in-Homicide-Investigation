import React, { useState, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";
// import './ArchiveEmployees.css';
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import { client } from "../data/data";
import { notify } from "../utils/error-box/notify";
import CaseABI from "./../Cases.json";
import { waitForTransaction, writeContract } from '@wagmi/core'

export const CaptainTrusteeAccess = () => {
  const requestCategory = [
    { name: "Create Branch", "end-point": "create-branch" },
    { name: "Officer Onboard", "end-point": "officer-onboard" },
    { name: "Officer Offboard", "end-point": "officer-offboard" },
    { name: "Transfer Officer Branch", "end-point": "transfer-officer-branch" },
    { name: "Update Branch", "end-point": "update-branch" },
    { name: "Update Officer", "end-point": "update-officer" },
    { name: "Transfer Captain", "end-point": "transfer-captain" },
    { name: "Transfer Case", "end-point": "transfer-case" },
  ];

  const [trusteesReq, setTrusteesReq] = useState([]);

  let navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const query = `
            {
                trustees(where: {branchId: "${localStorage.getItem("branchid")}", approved: true}) {
                    caseId
                    trustree
                }
            }
        `;
    try {
        const response = await client.query(query).toPromise();
        const { data, fetching, error  } = response;
        // console.log("data: ", data.trustees);
        setTrusteesReq(data.trustees);
      } catch (error) {
        console.log("error", error);
      }
  }

  async function handleRevoke(cardCaseId, cardTrustree) {
    console.log("case: ", cardCaseId)
    console.log("cardTrustree: ", cardTrustree)
    try {
      const { hash } = await writeContract({
        address: process.env.REACT_APP_CASE_CONTRACT,
        abi: CaseABI,
        functionName: 'revokeTrusteeAccess',
        args: [cardTrustree, cardCaseId, localStorage.getItem("branchid")],
        chainId: 11155111
      })
      console.log("hash :: ", hash)

      // wait for txn
      const result = await waitForTransaction({
          hash: hash,
      })
      console.log("Transaction result:", result);
      notify('success', 'Transaction Success')
    } catch(error) {
      console.log(error);
      notify("error", "Error in revoking")
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <h1 className="m-4">Trustee Access</h1>
      </div>

      {/* According to index of status category choosen from the dropdown trustee list is shown */}
      <div className="emp-card-container">
        {trusteesReq.map((card, index) => (
          <Card
            key={index}
            style={{ width: "18rem" }}
            className="emp-case-card"
          >
            <Card.Body>
              <Card.Title>Case Id #{card.caseId}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{card.trustree}</Card.Subtitle>
              <button
                className="emp-card-btn"
                onClick={() => handleRevoke(card.caseId, card.trustree)}
              >
                Revoke
              </button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </>
  );
};
