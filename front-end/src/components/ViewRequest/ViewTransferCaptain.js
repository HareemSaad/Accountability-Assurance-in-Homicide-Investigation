import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import "./view.css";
import axios from "axios";
import { useAccount } from "wagmi";
import moment from "moment";
import { writeContract, waitForTransaction, getWalletClient } from "@wagmi/core";
import { keccakString } from "../utils/hashing/keccak-hash.js";
import CaseABI from "./../Cases.json";
// hashes
import { transferCaptainHash } from "../utils/hashing/transferCaptainHash.js";
import { toCaseTypedDataHash } from "../utils/hashing/casesDomainHash.js";

export const ViewTransferCaptain = () => {
  const { reqId } = useParams();
  const { address, connector, isConnected, account } = useAccount();

  let navigate = useNavigate();

  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [isPassedMessage, setIsPassedMessage] = useState("Send");
  const [requestDetail, setRequestDetail] = useState({});

  useEffect(() => {
    // console.log("rank::", localStorage.getItem("rank"))
    // console.log("rank::")
    const fetchData = async () => {
      axios
        .get(`http://localhost:3000/view-transfer-captain/:${reqId}`, {
          params: {
            userAddress: address,
          },
        })
        .then((result) => {
          setRequestDetail(result.data.document);
          console.log("result: ", result.data.document);
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

    const branchId = keccakString(requestDetail.branchId)

    try {
      console.log(
        requestDetail.moderator,
        requestDetail.fromCaptain,
        requestDetail.toCaptain,
        branchId,
        requestDetail.nonce,
        requestDetail.caseId,
        requestDetail.receiver,
        requestDetail.expiry
      );
      const hash = transferCaptainHash(
        requestDetail.moderator,
        requestDetail.fromCaptain,
        requestDetail.toCaptain,
        branchId,
        requestDetail.nonce,
        requestDetail.caseId,
        requestDetail.receiver,
        requestDetail.expiry
      );

      console.log("hash", hash)

      const message = toCaseTypedDataHash(hash);

      const signature = await client.request(
        {
          method: "eth_sign",
          params: [address, message],
        },
        { retryCount: 0 }
      );
      console.log("signature:: ", signature)

      // send signers address and signature to backend
      axios
        .post(`http://localhost:3000/view-transfer-captain/:${reqId}`, {
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
      console.log("Error:: ", err);
    }
  };

  const handleSend = async (e) => {
    // Hareem todo - send by moderator
    e.preventDefault();
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);
    try {
      console.log(
        {
          moderator: requestDetail.moderator,
          fromCaptain: requestDetail.fromCaptain,
          toCaptain: requestDetail.toCaptain,
          branchId: keccakString(requestDetail.branchId),
          nonce: requestDetail.nonce,
          caseId: requestDetail.caseId,
          reciever: false,
          expiry: requestDetail.expiry
        },
        [requestDetail.signatureFromCaptain, requestDetail.signatureToCaptain],
        [requestDetail.fromCaptain, requestDetail.toCaptain]
      );
      const { hash } = await writeContract({
        address: process.env.REACT_APP_CASE_CONTRACT,
        abi: CaseABI,
        functionName: "transferCaseCaptain",
        args: [
          {
            moderator: requestDetail.moderator,
            fromCaptain: requestDetail.fromCaptain,
            toCaptain: requestDetail.toCaptain,
            branchId: keccakString(requestDetail.branchId),
            nonce: requestDetail.nonce,
            caseId: requestDetail.caseId,
            reciever: false,
            expiry: requestDetail.expiry
          },
          [requestDetail.signatureFromCaptain, requestDetail.signatureToCaptain],
          [requestDetail.fromCaptain, requestDetail.toCaptain]
        ],
        chainId: 11155111,
      });

      // wait for txn
      const result = await waitForTransaction({
        hash: hash,
      });
      console.log("Transaction result:", result);

      axios
      .delete(`http://localhost:3000/delete-transfer-captain/:${reqId}`)
      .then((response) => {
        console.log(response.data); // Handle the response from the server
      })
      .catch((error) => {
        console.error(error); // Handle errors
      });
      console.log("hash :: ", hash);

      notify("success", "Transaction Success");
      setIsPassedMessage("Sent")
    } catch (error) {
      console.log(error);
      notify("error", "Error in Transfering");
    }
  }

  const getDate = (expiryDate) => {
    var date = new Date(expiryDate * 1000);
    return moment(date).format("MMMM Do YYYY");
  };

  return (
    <div className="container">
      <div className="m-3 mt-5 mb-4 d-flex flex-row">
        {/* <h2 className="m-3 mt-5 mb-4">Trustee Request #{reqId}</h2> */}
        <h2>Transfer Captain Request #{reqId}</h2>
        <h6
          className={`statusTag${
            requestDetail.isOpen === true ? "Open" : "Close"
          } ms-3`}
        >
          #{requestDetail.isOpen === true ? "OPEN" : "CLOSED"}
        </h6>
      </div>

      <form>
        {/* Moderator */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="moderator" className="col-form-label">
              <b>
                <em>Moderator Address:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="moderator"
              id="moderator"
              className="form-control"
              value={requestDetail.moderator}
              disabled
            ></input>
          </div>
        </div>

        {/* fromCaptain */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="fromCaptain" className="col-form-label">
              <b>
                <em>From Captain:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="fromCaptain"
              id="fromCaptain"
              className="form-control"
              value={requestDetail.fromCaptain}
              disabled
            ></input>
          </div>
        </div>

        {/* toCaptain */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="toCaptain" className="col-form-label">
              <b>
                <em>To Captain:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="toCaptain"
              id="toCaptain"
              className="form-control"
              value={requestDetail.toCaptain}
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

        {/* Case Id */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="caseId" className="col-form-label">
              <b>
                <em>Case Id:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="number"
              name="caseId"
              id="caseId"
              className="form-control"
              value={requestDetail.caseId}
              disabled
            ></input>
          </div>
        </div>

        {/* Signers */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="branchId" className="col-form-label">
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
          requestDetail.signers.length === 2 && localStorage.getItem("rank") == "Captain" ? (
            <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
              type="submit"
              onClick={async (e) => await handleSubmit(e)}
              disabled="true"
            >
              Signed by Both Captains
            </button>
          ) : requestDetail.signers.length < 2 && localStorage.getItem("rank") == "Captain" ? (
            <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
              type="submit"
              onClick={async (e) => await handleSubmit(e)}
              disabled={isButtonDisabled}
            >
              Sign
            </button>
            ) : requestDetail.signers.length === 2 && localStorage.getItem("rank") == "Moderator" ? (
              <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
                type="submit"
                onClick={async (e) => await handleSend(e)}
                disabled={isButtonDisabled}
              >
                Send
              </button>
            )
            : (
              <button
                className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
                  type="submit"
                  onClick={async (e) => await handleSubmit(e)}
                  disabled="true"
                >
                  Both Captains haven't Signed Yet.
                  {/* Send */}
                </button>
            )
        ) : (
          <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
              type="submit"
              disabled="true"
            >
              {/* {isPassedMessage} */}
              Expiry Date has Passed. 
            </button>
        )}
        </form>
    </div>
  );
};
