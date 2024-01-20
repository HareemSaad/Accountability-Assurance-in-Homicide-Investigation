import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { employmentStatusMap, rankMap } from "../data/data.js";
import moment from "moment";
import { readContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import LedgerABI from "./../Ledger.json";
import {
  writeContract,
  waitForTransaction,
  getWalletClient,
} from "@wagmi/core";
// hashes
import { officerOffboardHash } from "../utils/hashing/officerOffboard.js";
import { toLedgerTypedDataHash } from "../utils/hashing/ledgerDomainHash.js";
import { keccakInt, keccakString } from "../utils/hashing/keccak-hash.js";

export const ViewOfficerOffboard = () => {
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
        .get(`http://localhost:3000/view-officer-offboard/:${reqId}`)
        .then(async (result) => {
          setRequestDetail(result.data.document);

          if (result.data.document.isOpen) {
            console.log("isopen:: ", result.data.document.isOpen);
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
              const calculateModerator = (signersCount / modCount) * 100n;

              if (calculateModerator >= 51n) {
                // hareem todo - send request
                setIsPassedMessage("Send! Request approved by over 51%.");
                setIsPassed(true);
              }
              // console.log("modCount: ", modCount);
              // console.log("calculateModerator: ", calculateModerator);
            } else {
              // Handle the case when modCount is 0
              notify("error", "No moderator in the State Code");
              setIsPassedMessage("No moderator in the State Code");
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

    // creating signature
    const client = await getWalletClient({ account, connector });

    const branchId = keccakString(requestDetail.branchId);

    const badge = keccakString(requestDetail.badge);

    const legalNumber = keccakInt(requestDetail.legalNumber);

    try {
      const hash = officerOffboardHash(
        requestDetail.verifiedAddress,
        requestDetail.nonce,
        requestDetail.name,
        legalNumber,
        badge,
        branchId,
        requestDetail.employmentStatus,
        requestDetail.rank,
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

      // axiospost - update the array of signers/signatures...
      axios
        .post(`http://localhost:3000/view-officer-offboard/:${reqId}`, {
          userAddress: address,
          signature: signature,
        })
        .then((res) => notify("success", "Signed successfully"))
        .catch((err) => {
          // console.log("error:: ", err);
          notify("error", `An Error Occured when Signing`);
        });
    } catch (err) {
      console.log("Error message:: ", err.message);
      notify("error", `An Error Occured when Signing the Request`);
    }
  };

  const getDate = (expiryDate) => {
    var date = new Date(expiryDate * 1000);
    return moment(date).format("MMMM Do YYYY");
  };

  return (
    <div className="container">
      <div className="m-3 mt-5 mb-4 d-flex flex-row">
        {/* <h2 className="m-3 mt-5 mb-4">Officer Offboard Request #{reqId}</h2> */}
        <h2>Officer Offboard Request #{reqId}</h2>
        <h6
          className={`statusTag${
            requestDetail.isOpen === true ? "Open" : "Close"
          } ms-3`}
        >
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
              value={employmentStatusMap.get(
                `${requestDetail.employmentStatus}`
              )}
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
            className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
            type="submit"
            onClick={async (e) => await handleSubmit(e)}
            disabled={isButtonDisabled}
          >
            {/* Sign */}
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
