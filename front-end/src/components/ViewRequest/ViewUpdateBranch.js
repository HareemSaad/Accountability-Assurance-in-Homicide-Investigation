import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { readContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import moment from "moment";
import LedgerABI from "./../Ledger.json";
import {
  writeContract,
  waitForTransaction,
  getWalletClient,
} from "@wagmi/core";
// hashes
import { updateBranchHash } from "../utils/hashing/updateBranch.js";
import { toLedgerTypedDataHash } from "../utils/hashing/ledgerDomainHash.js";
import { keccakInt, keccakString } from "../utils/hashing/keccak-hash.js";

export const ViewUpdateBranch = () => {
  const { reqId } = useParams();
  const { address, connector, isConnected, account } = useAccount();

  let navigate = useNavigate();

  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [requestDetail, setRequestDetail] = useState({});
  const [isPassedMessage, setIsPassedMessage] = useState("Sign");
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      axios
        .get(`http://localhost:3000/view-update-branch/:${reqId}`)
        .then(async (result) => {
          setRequestDetail(result.data.document);
          // console.log("result:: ", result.data);

          if (result.data.document.isOpen) {
            // moderators count of the same state - contract call
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

            if (modCount !== 0n) {
              const signersCount = BigInt(result.data.document.signers.length);
              const calculateModerator = (signersCount * 100n / modCount);

              if (calculateModerator >= 51n) {
                // hareem todo - send request
                setIsPassedMessage("Send! Request approved by over 51%.");
                setIsPassed(true);
              }
              // console.log("modCount: ", modCount);
              // console.log("calculateModerator: ", calculateModerator);
            } else {
              // Handle the case when modCount is 0
              notify("error", "No moderator in the State Code.");
              setIsPassedMessage("No moderator in the State Code.");
            }
          } else {
            setIsPassedMessage("Request not approved. Less than 51% support.");
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

    const client = await getWalletClient({ account, connector });

    const branchId = keccakString(requestDetail.branchId);

    try {
      const hash = updateBranchHash(
        requestDetail.nonce,
        requestDetail.precinctAddress,
        requestDetail.jurisdictionArea,
        requestDetail.stateCode,
        branchId,
        requestDetail.expiry
      );
      // console.log("hash", hash)

      const message = toLedgerTypedDataHash(hash);

      const signature = await client.request(
        {
          method: "eth_sign",
          params: [address, message],
        },
        { retryCount: 0 }
      );
      console.log("signature:: ", signature);

      axios
        .post(`http://localhost:3000/view-update-branch/:${reqId}`, {
          userAddress: address,
          signature: signature
        })
        .then((res) => {
          const message = res.data.message;
          notify("success", message);
        })
        .catch((err) => {
          // console.log("error:: ", err);
          notify("error", `An Error Occured when Signing`);
        });
    } catch (err) {
      console.log("Error message:: ", err.message);
      notify("error", `An Error Occured when Signing the Request`);
    }
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
    const date = new Date(expiryDate * 1000);
    return moment(date).format("MMMM Do YYYY");
  };

  return (
    <div className="container">
      <div className="m-3 mt-5 mb-4 d-flex flex-row">
        {/* <h2 className="m-3 mt-5 mb-4">Update Branch Request #{reqId}</h2> */}
        <h2>Update Branch Request #{reqId}</h2>
        <h6
          className={`statusTag${
            requestDetail.isOpen === true ? "Open" : "Closed"
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
        {requestDetail && requestDetail.isOpen ? (
          <button
            className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
            type="submit"
            onClick={async (e) => await handleSubmit(e)}
            disabled={isButtonDisabled}
          >
            {isPassedMessage}
          </button>
        ) : (
          <button
            className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
            disabled="true"
          >
            {isPassedMessage}
          </button>
        )}
      </form>
    </div>
  );
};
