import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify.js";
import "react-toastify/dist/ReactToastify.css";
import { useAccount } from "wagmi";
import { participantTypeMap } from "../data/data.js";
import { client } from "../data/data.js";
import { decodeBytesString } from "../utils/decoders/bytesToString.js";
import { waitForTransaction, writeContract } from '@wagmi/core'
import CaseABI from "./../Cases.json";

export const ViewParticipant = () => {
  const { caseId, participantId } = useParams();
  const { address } = useAccount();

  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [requestDetail, setRequestDetail] = useState({});
  const [caseParticipant, setCaseParticipant] = useState({});


  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const query = `
      {
        participant(id: "${participantId}") {
          category
          approve
          data
          id
        }
      }
      `
      const response = await client.query(query).toPromise();
      const { data } = response;
      setCaseParticipant(data.participant)
    } catch (error) {
      console.log(error);
      notify("error", "Failed to get case details")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);
    try {
      const { hash } = await writeContract({
          address: process.env.REACT_APP_CASE_CONTRACT,
          abi: CaseABI,
          functionName: 'approveParticipant',
          args: [caseId, participantId],
          chainId: 11155111
      })
      console.log("hash :: ", hash)

      // wait for txn
      const result = await waitForTransaction({
          hash: hash,
      })
      console.log("Transaction result:", result);
      notify('success', 'Transaction Success')
      
    } catch (error) {
      console.log(error);
      notify("error", "Error in submitting the form")
    }
  };

  return (
    <div className="container">

      <div className="m-3 mt-5 mb-4 d-flex flex-row">
        {/* <h2 className="m-3 mt-5 mb-4">Officer Onboard Request #{reqId}</h2> */}
        <h2>Case #{caseId}</h2>
        <h6 className={`statusTag${caseParticipant.approve === true ? "Open" : "Close"} ms-3`} >
          #{requestDetail.isOpen === true ? "APPROVED" : "NOT APPROVED"}
        </h6>
      </div>
      
      <form>
        {/* Case Id */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="verifiedAddress" className="col-form-label">
              <b>
                <em>Case Id:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="verifiedAddress"
              id="verifiedAddress"
              className="form-control"
              value={caseId}
              disabled
            ></input>
          </div>
        </div>

        {/* Participant Id */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="name" className="col-form-label">
              <b>
                <em>Participant Id:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="name"
              id="name"
              className="form-control"
              value={participantId}
              disabled
            ></input>
          </div>
        </div>

        {/* Category */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="legalNumber" className="col-form-label">
              <b>
                <em>Category:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="legalNumber"
              id="legalNumber"
              className="form-control"
              value={participantTypeMap[caseParticipant.category]}
              disabled
            ></input>
          </div>
        </div>

        {/* Data */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="badge" className="col-form-label">
              <b>
                <em>Data:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <textarea
              type="text"
              name="badge"
              id="badge"
              className="form-control"
              value={caseParticipant.data ? decodeBytesString(caseParticipant.data) : "No data"}
              disabled
            ></textarea>
          </div>
        </div>

        {
          localStorage.getItem("rank") === "Captain" && !caseParticipant.approve?
          (
            <div className='div-btn'>
              <button className='case-nav-btn' name="add-participant" onClick={(e) => handleSubmit(e)}>Approve Participant</button>
            </div>
          ) :
          (
            <div className='div-btn'>
              
            </div>
          )
        }
      </form>
    </div>
  );
};
