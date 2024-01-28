import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import { useAccount } from "wagmi";
import axios from "axios";
import "./createRequests.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import Dropdown from "react-bootstrap/Dropdown";
import { stateCodes } from "../data/data.js";
import { writeContract, waitForTransaction, getWalletClient } from "@wagmi/core";
import { getUserStateCode } from "../utils/queries/getUserStateCode.js";
// hashes
import { createBranchHash } from "../utils/hashing/createBranch.js";
import { toLedgerTypedDataHash } from "../utils/hashing/ledgerDomainHash.js";
import { keccakInt, keccakString } from "../utils/hashing/keccak-hash.js";

export const CreateBranch = () => {
  let navigate = useNavigate();
  const { address, connector, isConnected, account } = useAccount();

  const [expiryDate, setExpiryDate] = useState("");
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [createBranchInfo, setCreateBranchInfo] = useState({
    nonce: Math.floor(Math.random() * 10000),
    precinctAddress: "",
    jurisdictionArea: "",
    stateCode: "",
    branchId: "",
    expiry: "",
    // signature: "",
    signers: address,
    isOpen: true,
  });  
  
  useEffect(() => {
    handleStateCodeDropdownSelect()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCreateBranchInfo({ ...createBranchInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  };

  // Function to handle state code dropdown selection
  const handleStateCodeDropdownSelect = async () => {
    const value =  await getUserStateCode(address);
    setSelectedStateCode(value);
    const name = "stateCode";
    setCreateBranchInfo({ ...createBranchInfo, [name]: value });
  }

  const handleDateChange = (fullDateTime) => {
    let unixTimestamp = moment(fullDateTime).unix();
    console.log("unixTimestamp:: ", unixTimestamp);

    // const date = new Date(fullDateTime);
    // console.log("date:: ", date);

    // const unixTimestamp = Math.floor(date.getTime() / 1000);
    // console.log("unixTimestamp:: ", unixTimestamp);

    setCreateBranchInfo({ ...createBranchInfo, ["expiry"]: unixTimestamp });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (createBranchInfo.precinctAddress === "") {
      notify("error", `Precinct Address is empty`);
    } else if (createBranchInfo.jurisdictionArea === "") {
      notify("error", `Jurisdiction Area is empty`);
    } else if (createBranchInfo.stateCode === "") {
      notify("error", `State Code is empty`);
    } else if (createBranchInfo.branchId === "") {
      notify("error", `Branch Id is empty`);
    } else if (createBranchInfo.expiry === "") {
      notify("error", `Select an Expiry Date`);
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);

      const client = await getWalletClient({ account, connector });

      const branchId = keccakString(createBranchInfo.branchId);

      try {
        const hash = createBranchHash(
          createBranchInfo.nonce,
          createBranchInfo.precinctAddress,
          createBranchInfo.jurisdictionArea,
          createBranchInfo.stateCode,
          branchId,
          createBranchInfo.expiry
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
          .post(
            "http://localhost:3000/create-request/create-branch", {
              createBranchInfo: createBranchInfo,
              signature: signature
            }
          )
          .then((res) =>
            notify("success", "Create Branch Request Created successfully")
          )
          .catch((err) => {
            // console.log("error:: ", err);
            notify(
              "error",
              `An Error Occured when Creating Create Branch Request`
            );
          });
      } catch (err) {
        console.log("Error message:: ", err.message);
        notify(
          "error",
          `An Error Occured when Creating Create Branch Request`
        );
      }
    }
  };

  const CustomInput = ({ value, onClick }) => {
    return (
      <div className="input-group">
        <input
          type="text"
          className="form-control expiryDateInput"
          value={value}
          onClick={onClick}
          placeholder="Select Expiry Date"
          readOnly
        />
        <div className="input-group-append">
          <span className="input-group-text">
            <FaCalendarAlt />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <h2 className="m-3 mt-5 mb-4">Create Branch</h2>
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
              placeholder="Enter Precinct Address Here"
              className="form-control"
              onChange={handleChange}
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
              placeholder="Enter Jurisdiction Area Here"
              className="form-control"
              onChange={handleChange}
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
                placeholder="Enter State Code Here"
                className="form-control"
                value={createBranchInfo.stateCode}
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
              placeholder="Enter Branch Id Here"
              className="form-control"
              onChange={handleChange}
            ></input>
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
            <label>
              <DatePicker
                selected={expiryDate}
                name="expiry"
                onChange={(date) => {
                  setExpiryDate(date);
                  handleDateChange(date);
                }}
                dateFormat="dd/MM/yyyy"
                minDate={moment().add(1, "day").toDate()}
                placeholderText="Select Expiry Date"
                customInput={<CustomInput />}
              />
            </label>
          </div>
        </div>

        <button
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
          type="submit"
          onClick={async (e) => await handleSubmit(e)}
          disabled={isButtonDisabled}
        >
          Create Request for Create Branch
        </button>
      </form>
    </div>
  );
};
