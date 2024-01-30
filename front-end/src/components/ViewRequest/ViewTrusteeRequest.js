import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import "./view.css";
import axios from "axios";
import { useAccount } from "wagmi";
import moment from "moment";
import { trusteeHash } from "../utils/hashing/trusteeHash";
import { toCaseTypedDataHash } from "../utils/hashing/caseDomainHash";
import {
  writeContract,
  waitForTransaction,
  getWalletClient,
} from "@wagmi/core";
import { keccakString } from "../utils/hashing/keccak-hash";
import CaseABI from "./../Cases.json";

export const ViewTrusteeRequest = () => {
  const { reqId } = useParams();

  let navigate = useNavigate();
  const { address, connector, isConnected, account } = useAccount();

  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [requestDetail, setRequestDetail] = useState({});
  const [isPassedMessage, setIsPassedMessage] = useState("Sign");
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      axios
        .get(`http://localhost:3000/view-trustee-request/:${reqId}`)
        .then((result) => {
          setRequestDetail(result.data.document);
          if (result.data.document.signers.length > 0) {
            setIsPassedMessage("Request approved! Send.");
            setIsPassed(true);
          } else {
            setIsPassedMessage("Request not approved.");
          }
        })
        .catch((err) => console.log("error:: ", err));
    };
    fetchData();
  }, []);

  // const requestDetail = {
  //     caseId: '235',
  //     trusteeAddress: '0234rtjb',
  //     captainAddress: '0ZXGETR4557852',
  //     branchId: '3',
  //     signer: ['0X24335faerw', '0Xkdfa3245325', '0Xklouwrn34iy08', '0Xkdfa3245325', '0X24335faerw', '0X24335faerw', '0Xkdfa3245325', '0Xklouwrn34iy08', '0Xkdfa3245325', '0X24335faerw', '0Xklouwrn34iy08', '0Xkdfa3245325', '0X24335faerw', '0Xkdfa3245325', '0Xklouwrn34iy08', '0Xkdfa3245325', '0X24335faerw', '0X24335faerw', '0Xkdfa3245325', '0Xklouwrn34iy08', '0Xkdfa3245325', '0X24335faerw', '0Xklouwrn34iy08', '0Xklouwrn34iy080Xkdfa32453250Xklouwrn34iy08']
  // };

  const handleSign = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);

    try {
      const client = await getWalletClient({ account, connector });

      console.log(
        requestDetail.caseId,
        requestDetail.trustee,
        address,
        requestDetail.captain,
        keccakString(requestDetail.branchId),
        requestDetail.expiry
      );

      const hash = trusteeHash(
        requestDetail.caseId,
        requestDetail.trustee,
        address,
        requestDetail.captain,
        keccakString(requestDetail.branchId),
        requestDetail.expiry
      );

      console.log("hash", hash);

      const message = toCaseTypedDataHash(hash);

      const signature = await client.request(
        {
          method: "eth_sign",
          params: [address, message],
        },
        { retryCount: 0 }
      );

      console.log("sig: ", signature);

      // axiospost - update the array of signers/signatures...
      axios
        .post(`http://localhost:3000/view-trustee-request/:${reqId}`, {
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
    } catch (error) {
      console.log(error);
      notify("error", `Error while sending transaction`);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);
    try {
      console.log(address);
      // call contract
      const { hash } = await writeContract({
        address: process.env.REACT_APP_CASE_CONTRACT,
        abi: CaseABI,
        functionName: "grantTrusteeAccess",
        args: [
          {
            caseId: requestDetail.caseId,
            trustee: requestDetail.trustee,
            moderator: requestDetail.moderator,
            captain: requestDetail.captain,
            branchId: keccakString(requestDetail.branchId),
            expiry: requestDetail.expiry,
          },
          requestDetail.signature[0],
        ],
        chainId: 11155111,
      });
      console.log("hash :: ", hash);

      // wait for txn
      const result = await waitForTransaction({
        hash: hash,
      });
      console.log("Transaction result:", result);

      axios
      .delete(`http://localhost:3000/delete-trustee-request/:${reqId}`)
      .then((response) => {
        console.log(response.data); // Handle the response from the server
      })
      .catch((error) => {
        console.error(error); // Handle errors
      });
      
      notify("success", "Transaction Success");
    } catch (error) {
      console.log(error);
      notify("error", "Transaction Failed");
    }
  };

  const getDate = (expiryDate) => {
    var date = new Date(expiryDate * 1000);
    return moment(date).format("MMMM Do YYYY");
  };

  return (
    <div className="container">
      <div className="m-3 mt-5 mb-4 d-flex flex-row">
        {/* <h2 className="m-3 mt-5 mb-4">Trustee Request #{reqId}</h2> */}
        <h2>Trustee Request #{reqId}</h2>
        <h6
          className={`statusTag${
            requestDetail.isOpen === true ? "Open" : "Closed"
          } ms-3`}
        >
          #{requestDetail.isOpen === true ? "OPEN" : "CLOSED"}
        </h6>
      </div>

      <form>
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

        {/* Trustee */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="trustee" className="col-form-label">
              <b>
                <em>Trustee Address:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="trustee"
              id="trustee"
              className="form-control"
              value={requestDetail.trustee}
              disabled
            ></input>
          </div>
        </div>

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

        {/* captain address*/}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="captain" className="col-form-label">
              <b>
                <em>Captain Address:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="captain"
              id="captain"
              className="form-control"
              value={requestDetail.captain}
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
        {/* <div className="row g-3 align-items-center m-3">
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
        </div> */}

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

        {/* button */}
        {requestDetail && requestDetail.isOpen ? (
          localStorage.getItem("rank") === "Captain" && isPassed ? (
            <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
              type="submit"
              onClick={async (e) => await handleSend(e)}
              disabled={isButtonDisabled}
            >
              {/* send */}
              {isPassedMessage}
            </button>
          ) : localStorage.getItem("rank") === "Captain" &&
            isPassed === false ? (
            <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
              type="submit"
              // onClick={async (e) => await handleSend(e)}
              disabled="true"
            >
              No one has signed yet.
            </button>
          ) : (
            <button
              className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
              type="submit"
              onClick={async (e) => await handleSign(e)}
              disabled={isButtonDisabled}
            >
              Sign
            </button>
          )
        ) : (
          <button
            className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
            type="submit"
            // onClick={async (e) => await handleSubmit(e)}
            disabled="true"
          >
            {/* cant sign or send */}
            {/* {isPassedMessage} */}
            Request Closed.
          </button>
        )}
      </form>
    </div>
  );
};
