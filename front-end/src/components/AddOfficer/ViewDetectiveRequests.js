import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { employmentStatusMap, rankMap } from "../data/data.js";
import moment from "moment";
import { waitForTransaction, writeContract } from '@wagmi/core';
import LedgerABI from "./../Ledger.json"
import { keccakString, keccakInt } from "../utils/hashing/keccak-hash.js";

export const ViewDetectiveRequests = () => {
  const { reqId } = useParams();
  let navigate = useNavigate();

  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [requestDetail, setRequestDetail] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:3000/view-detective-requests/:${reqId}`)
      .then((result) => {setRequestDetail(result.data[0])})
      .catch((err) => console.log("error:: ", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);
    // hareem - send button...
    try {

      console.log("output:: ", requestDetail);
      console.log(requestDetail.legalNumber, keccakInt(requestDetail.legalNumber));
      
      // call contract
      const { hash } = await writeContract({
        address: process.env.REACT_APP_LEDGER_CONTRACT,
        abi: LedgerABI,
        functionName: 'onboard',
        args: [
          requestDetail.nonce,
          localStorage.getItem("statecode"),
          requestDetail.verifiedAddress,
          requestDetail.name,
          keccakInt(requestDetail.legalNumber),
          keccakString(requestDetail.badge),
          keccakString(requestDetail.branchId),
          requestDetail.rank,
          requestDetail.expiry,
          requestDetail.signature,
          requestDetail.signers
        ],
        chainId: 11155111
      })
      console.log("hash :: ", hash)

      // wait for txn
      const result = await waitForTransaction({
          hash: hash,
      })
      console.log("Transaction result:", result);

      // amaim -- delete request from table

      axios.delete(`http://localhost:3000/delete-detective-request/:${reqId}`)
      .then(response => {
        console.log(response.data); // Handle the response from the server
      })
      .catch(error => {
        console.error(error); // Handle errors
      });
      notify("success", "Onboarding Successful");
      
    } catch (error) {
      console.log(error)
      notify("error", "Error sending transaction");
    }
    // axios
    //   .post(`http://localhost:3000/view-detective-requests/:${reqId}`, {
    //     userAddress: userAddress,
    //   })
    //   .then((res) => notify("success", "Signed successfully"))
    //   .catch((err) => {
    //     // console.log("error:: ", err);
    //     notify("error", `An Error Occured when Signing`);
    //   });
  };

  const getDate = (expiryDate) => {
    var date = new Date(expiryDate * 1000);
    return moment(date).format("MMMM Do YYYY");
  };

  return (
    <div className="container">

      <div className="m-3 mt-5 mb-4 d-flex flex-row">
        {/* <h2 className="m-3 mt-5 mb-4">Officer Onboard Request #{reqId}</h2> */}
        <h2>Detective Onboard Request #{reqId}</h2>
        <h6 className={`statusTag${requestDetail.isOpen === true ? "Open" : "Close"} ms-3`} >
          #{requestDetail.isOpen === true ? "OPEN" : "CLOSED"}
        </h6>
      </div>
      
      <form>
        {/* Verified Address */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="verifiedAddress" className="col-form-label">
              <b>
                <em>Verified Address:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="verifiedAddress"
              id="verifiedAddress"
              className="form-control"
              value={requestDetail.verifiedAddress}
              disabled
            ></input>
          </div>
        </div>

        {/* Name */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="name" className="col-form-label">
              <b>
                <em>Name:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="name"
              id="name"
              className="form-control"
              value={requestDetail.name}
              disabled
            ></input>
          </div>
        </div>

        {/* legal Number */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="legalNumber" className="col-form-label">
              <b>
                <em>Legal Number:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="number"
              name="legalNumber"
              id="legalNumber"
              className="form-control"
              value={requestDetail.legalNumber}
              disabled
            ></input>
          </div>
        </div>

        {/* badge */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="badge" className="col-form-label">
              <b>
                <em>Badge:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="badge"
              id="badge"
              className="form-control"
              value={requestDetail.badge}
              disabled
            ></input>
          </div>
        </div>

        {/* Branch Id */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="branchId" className="col-form-label">
              <b>
                <em>Branch Id:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="branchId"
              id="branchId"
              className="form-control"
              value={requestDetail.branchId}
              disabled
            ></input>
          </div>
        </div>

        {/* Officer Rank dropdown */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="officerRank" className="col-form-label">
              <b>
                <em>Officer Rank:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="rank"
              id="rank"
              className="form-control"
              value={rankMap.get(requestDetail.rank)}
              disabled
            ></input>
          </div>
        </div>

        {/* Employment Status */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="employmentStatus" className="col-form-label">
              <b>
                <em>Employment Status:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="employmentStatus"
              id="employmentStatus"
              className="form-control"
              value={employmentStatusMap.get(`${requestDetail.employmentStatus}`)}
              disabled
            />
          </div>
        </div>

        {/* Signers */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="signers" className="col-form-label">
              <b>
                <em>Signers:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input d-flex flex-wrap">
              <input
                type="text"
                name="signers"
                id="signers"
                className="form-control"
                value={requestDetail.signers}
                disabled
              />
          </div>
        </div>

        {/* Expiry */}
        <div className="row g-3 align-items-center m-3 mb-5">
          <div className="col-2">
            <label htmlFor="expiry" className="col-form-label">
              <b>
                <em>Expiry Date:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="expiry"
              id="expiry"
              className="form-control"
              value={getDate(requestDetail.expiry)}
              disabled
            ></input>
          </div>
        </div>

        {/* sign button */}
        <button
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
          type="submit"
          onClick={async (e) => await handleSubmit(e)}
          disabled={isButtonDisabled}
        >
          Onboard
        </button>
      </form>
    </div>
  );
};
