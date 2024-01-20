import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useAccount } from "wagmi";
import { employmentStatusMap, rankMap } from "../data/data.js";
import moment from "moment";
import { writeContract, waitForTransaction, getWalletClient } from "@wagmi/core";
// hashes
import { transferOfficerBranchHash } from "../utils/hashing/transferOfficerBranchHash.js";
import { toLedgerTypedDataHash } from "../utils/hashing/ledgerDomainHash.js";
import { keccakInt, keccakString } from "../utils/hashing/keccak-hash.js";

export const ViewTransferOfficerBranch = () => {
  const { reqId } = useParams();
  const { address, connector, isConnected, account } = useAccount();

  let navigate = useNavigate();

  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [requestDetail, setRequestDetail] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:3000/view-transfer-officer-branch/:${reqId}`, {
        params: {
          userAddress: address,
        },
      })
      .then((result) => {
        setRequestDetail(result.data.document);
        // console.log("result: ", result.data.document);
      })
      .catch((err) => console.log("error:: ", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);

    const client = await getWalletClient({ account, connector });

    const legalNumber = keccakInt(requestDetail.legalNumber)
    const badge = keccakString(requestDetail.badge)
    const branchId = keccakString(requestDetail.branchId)
    const toBranchId = keccakString(requestDetail.toBranchId)

    try {
      const hash = transferOfficerBranchHash(
        requestDetail.verifiedAddress,
        requestDetail.nonce,
        requestDetail.name,
        legalNumber,
        badge,
        branchId,
        toBranchId,
        requestDetail.employmentStatus,
        requestDetail.rank,
        requestDetail.receiver,
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
        .post(`http://localhost:3000/view-transfer-officer-branch/:${reqId}`, {
          userAddress: address,
          signature: signature,
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

  const handleSend = (e) => {
    // Hareem todo - send by moderator
    e.preventDefault();
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);
    // after send
    // setIsPassedMessage("Sent");
  };

  const getDate = (expiryDate) => {
    var date = new Date(expiryDate * 1000);
    return moment(date).format("MMMM Do YYYY");
  };

  // Function to handle rank dropdown item selection
  //   const rankName = (officerRank) => {
  //     const name = "rank";
  //     if (officerRank == 0) {
  //         setRequestDetail({ ...requestDetail, [name]: "" });
  //     } else if (officerRank == 1) {
  //         setRequestDetail({ ...requestDetail, [name]: "Officer" });
  //     } else if (officerRank == 2) {
  //         setRequestDetail({ ...requestDetail, [name]: "Detective" });
  //     } else if (officerRank == 3) {
  //         setRequestDetail({ ...requestDetail, [name]: "Captain" });
  //     }
  //     return requestDetail.rank;
  //   };

  //   // Function to handle employment status dropdown selection
  //   const employmentStatusName = (employmentStatus) => {
  //     const name = "employmentStatus";
  //     if (employmentStatus == 0) {
  //       setRequestDetail({ ...requestDetail, [name]: "" });
  //     } else if (employmentStatus == 1) {
  //       setRequestDetail({ ...requestDetail, [name]: "Active" });
  //     } else if (employmentStatus == 2) {
  //       setRequestDetail({ ...requestDetail, [name]: "Inactive" });
  //     } else if (employmentStatus == 3) {
  //       setRequestDetail({ ...requestDetail, [name]: "Fired" });
  //     } else if (employmentStatus == 4) {
  //       setRequestDetail({ ...requestDetail, [name]: "Retired" });
  //     }

  //     return requestDetail.employmentStatus;
  //   };

  return (
    <div className="container">
      <div className="m-3 mt-5 mb-4 d-flex flex-row">
        {/* <h2 className="m-3 mt-5 mb-4"> Transfer Officer Branch Request #{reqId} </h2> */}
        <h2>Transfer Officer Branch Request #{reqId}</h2>
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

        {/* To Branch Id */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="toBranchId" className="col-form-label">
              <b>
                <em>To Branch Id:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="toBranchId"
              id="toBranchId"
              className="form-control"
              value={requestDetail.toBranchId}
              disabled
            ></input>
          </div>
        </div>

        {/* Officer Rank dropdown */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="rank" className="col-form-label">
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
          requestDetail.signers.length === 2 &&
          localStorage.getItem("rank") == "Captain" ? (
            <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
              type="submit"
              onClick={async (e) => await handleSubmit(e)}
              disabled="true"
            >
              Signed by Both Captains
            </button>
          ) : requestDetail.signers.length < 2 &&
            localStorage.getItem("rank") == "Captain" ? (
            <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
              type="submit"
              onClick={async (e) => await handleSubmit(e)}
              disabled={isButtonDisabled}
            >
              Sign
            </button>
          ) : requestDetail.signers.length === 2 &&
            localStorage.getItem("rank") == "Moderator" ? (
            <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
              type="submit"
              onClick={async (e) => await handleSend(e)}
              disabled={isButtonDisabled}
            >
              Send
            </button>
          ) : (
            <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
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
            className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
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
