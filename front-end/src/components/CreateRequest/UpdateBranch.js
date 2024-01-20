import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Dropdown from "react-bootstrap/Dropdown";
import "./createRequests.css";
import { useAccount } from "wagmi";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { stateCodeMap, branchIdMap } from "../data/data.js";
import { writeContract, waitForTransaction, getWalletClient } from "@wagmi/core";
// hashes
import { updateBranchHash } from "../utils/hashing/updateBranch.js";
import { toLedgerTypedDataHash } from "../utils/hashing/ledgerDomainHash.js";
import { keccakInt, keccakString } from "../utils/hashing/keccak-hash.js";

export const UpdateBranch = () => {
  let navigate = useNavigate();
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const { address, connector, isConnected, account } = useAccount();

  const [expiryDate, setExpiryDate] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [updateBranchInfo, setUpdateBranchInfo] = useState({
    nonce: Math.floor(Math.random() * 10000),
    precinctAddress: "",
    jurisdictionArea: "",
    stateCode: "",
    branchId: "",
    expiry: "",
    signers: address,
    isOpen: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateBranchInfo({ ...updateBranchInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (updateBranchInfo.precinctAddress === "") {
      notify("error", `Precinct Address is empty`);
    } else if (updateBranchInfo.jurisdictionArea === "") {
      notify("error", `Jurisdiction Area is empty`);
    } else if (updateBranchInfo.stateCode === "") {
      notify("error", `State Code is empty`);
    } else if (updateBranchInfo.branchId === "") {
      notify("error", `Branch Id is empty`);
    } else if (updateBranchInfo.expiry === "") {
      notify("error", `Select an Expiry Date`);
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);

      const client = await getWalletClient({ account, connector });

      const branchId = keccakString(updateBranchInfo.branchId);

      try {
        const hash = updateBranchHash(
          updateBranchInfo.nonce,
          updateBranchInfo.precinctAddress,
          updateBranchInfo.jurisdictionArea,
          updateBranchInfo.stateCode,
          branchId,
          updateBranchInfo.expiry
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
            "http://localhost:3000/create-request/update-branch", {
              updateBranchInfo: updateBranchInfo,
              signature: signature
            }
          )
          .then((res) =>
            notify("success", "Update Branch Request Created successfully")
          )
          .catch((err) => {
            // console.log("error:: ", err);
            notify(
              "error",
              `An Error Occured when Creating Update Branch Request`
            );
          });
      } catch (err) {
        console.log("Error message:: ", err.message);
        notify("error", `An Error Occured when Creating Update Branch Request`);
      }
    }
  };

  // Function to handle state code dropdown selection
  const handleStateCodeDropdownSelect = (categoryValue) => {
    setSelectedStateCode(categoryValue);
    const name = "stateCode";
    setUpdateBranchInfo({ ...updateBranchInfo, [name]: categoryValue });
  };

  // Function to handle branch id dropdown selection
  const handleBranchIdDropdownSelect = (categoryValue) => {
    setSelectedBranchId(categoryValue);
    const name = "branchId";
    setUpdateBranchInfo({ ...updateBranchInfo, [name]: categoryValue });
  };

  // handle date field only
  const handleDateChange = (fullDateTime) => {
    let unixTimestamp = moment(fullDateTime).unix();
    console.log("unixTimestamp:: ", unixTimestamp);
    setUpdateBranchInfo({ ...updateBranchInfo, ["expiry"]: unixTimestamp });
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
      <h2 className="m-3 mt-5 mb-4">Update Branch</h2>
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
            <Dropdown>
              <Dropdown.Toggle
                variant="secondary"
                id="stateCode"
                className="dropdown"
              >
                {selectedStateCode
                  ? stateCodeMap.get(selectedStateCode)
                  : "Select State Code"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {Array.from(stateCodeMap).map(([key, value]) => (
                  <Dropdown.Item
                    name="stateCode"
                    key={key}
                    onClick={() => handleStateCodeDropdownSelect(key)}
                  >
                    {value}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
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
            <Dropdown>
              <Dropdown.Toggle
                variant="secondary"
                id="branchId"
                className="dropdown"
              >
                {selectedBranchId
                  ? branchIdMap.get(selectedBranchId)
                  : "Select Branch Id"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {Array.from(branchIdMap).map(([key, value]) => (
                  <Dropdown.Item
                    name="branchId"
                    key={key}
                    onClick={() => handleBranchIdDropdownSelect(key)}
                  >
                    {value}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
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

        {/* submit button */}
        <button
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
          type="submit"
          onClick={async (e) => await handleSubmit(e)}
          disabled={isButtonDisabled}
        >
          Create Request for Updating Branch
        </button>
      </form>
    </div>
  );
};
