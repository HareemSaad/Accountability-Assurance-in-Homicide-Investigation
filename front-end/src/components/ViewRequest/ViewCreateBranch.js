import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import moment from "moment";
import { readContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import LedgerABI from "./../Ledger.json";

export const ViewCreateBranch = () => {
  const { reqId } = useParams();
  const { address } = useAccount();

  const [isButtonDisabled, setButtonDisabled] = useState(false);

  let navigate = useNavigate();

  const [requestDetail, setRequestDetail] = useState({});
  const [isPassedMessage, setIsPassedMessage] = useState("");
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      axios
        .get(`http://localhost:3000/view-create-branch/:${reqId}`)
        .then(async (result) => {
          setRequestDetail(result.data.document);
          // console.log("result:: ", result.data.document);

          if (result.data.document.isOpen == false) {
            const modCount = await readContract({
              address: process.env.REACT_APP_LEDGER_CONTRACT,
              abi: LedgerABI,
              functionName: "moderatorCount",
              args: [
                result.data.document.stateCode, // uint _stateCode
              ],
              account: address,
              chainId: 11155111,
            });

            const signersCount = BigInt(result.data.document.signers.length);
            const calculateModerator = (signersCount / modCount) * 100n;

            // console.log("modCount: ", modCount);
            // console.log("calculateModerator: ", calculateModerator);

            if (calculateModerator > 51) {
              // hareem todo - send request
              setIsPassedMessage("Send! Request approved by over 51%.");
              setIsPassed(true);
            } else {
              setIsPassedMessage(
                "Request not approved. Less than 51% support."
              );
            }
          }
        })
        .catch((err) => console.log("error:: ", err));
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);
    // axiospost - update the array of signers/signatures...
    axios
      .post(`http://localhost:3000/view-create-branch/:${reqId}`, {
        userAddress: address,
      })
      .then((res) => {
        const message = res.data.message;
        notify("success", message);
      })
      .catch((err) => {
        // console.log("error:: ", err);
        notify("error", `An Error Occured when Signing`);
      });
  };

  const handleSend = async (e) => {
    // hareem handlesend todo
    e.preventDefault();
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);
  };

  const getDate = (expiryDate) => {
    var date = new Date(expiryDate * 1000);
    return moment(date).format("MMMM Do YYYY");
  };

  return (
    <div className="container">
      <div className="m-3 mt-5 mb-4 d-flex flex-row">
        {/* <h2 className="m-3 mt-5 mb-4">Create Branch Request #{reqId}</h2> */}
        <h2>Create Branch Request #{reqId}</h2>
        <h6
          className={`statusTag${
            requestDetail.isOpen === true ? "Open" : "Close"
          } ms-3`}
        >
          #{requestDetail.isOpen === true ? "OPEN" : "CLOSED"}
        </h6>
      </div>

      <form>
        {/* Precinct Address */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="precinctAddress" className="col-form-label">
              <b>
                <em>Precinct Address:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="precinctAddress"
              id="precinctAddress"
              className="form-control"
              value={requestDetail.precinctAddress}
              disabled
            ></input>
          </div>
        </div>

        {/* Jurisdiction Area */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="jurisdictionArea" className="col-form-label">
              <b>
                <em>Jurisdiction Area:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="number"
              name="jurisdictionArea"
              id="jurisdictionArea"
              className="form-control"
              value={requestDetail.jurisdictionArea}
              disabled
            ></input>
          </div>
        </div>

        {/* State Code */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="stateCode" className="col-form-label">
              <b>
                <em>State Code:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="number"
              name="stateCode"
              id="stateCode"
              className="form-control"
              value={requestDetail.stateCode}
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
            {(requestDetail.signers ?? []).length === 0 ? (
              <input
                type="text"
                className="form-control mb-2"
                value="No one has signed yet."
                disabled
              />
            ) : (
              requestDetail.signers.map((signer, index) => (
                <input
                  type="text"
                  name={`signer-${index}`}
                  id={`signer-${index}`}
                  className="form-control signer mb-2"
                  value={signer}
                  disabled
                />
              ))
            )}
          </div>
        </div>

        {/* Expiry */}
        <div className="row g-3 align-items-center m-3">
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
        {requestDetail && requestDetail.isOpen ? (
          <button
            className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
            type="submit"
            onClick={async (e) => await handleSubmit(e)}
            disabled={isButtonDisabled}
          >
            Sign
          </button>
        ) : isPassed ? (
          <button
            className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
            type="submit"
            onClick={async (e) => await handleSend(e)}
            disabled={isButtonDisabled}
          >
            {isPassedMessage}
          </button>
        ) : (
          <button
            className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
            disabled="true"
          >
            {isPassedMessage}
          </button>
        )}
      </form>
    </div>
  );
};
