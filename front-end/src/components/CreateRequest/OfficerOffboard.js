import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import { useAccount } from "wagmi";
import axios from "axios";
import { stateCodeMap, employmentStatusMap, rankMap, branchIdMap } from "../data/data.js";
import "./createRequests.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { writeContract, waitForTransaction, getWalletClient } from "@wagmi/core";
// hashes
import { officerOffboardHash } from "../utils/hashing/officerOffboard.js";
import { toLedgerTypedDataHash } from "../utils/hashing/ledgerDomainHash.js";
import { keccakInt, keccakString } from "../utils/hashing/keccak-hash.js";

export const OfficerOffboard = () => {
  let navigate = useNavigate();
  const { address, connector, isConnected, account } = useAccount();

  const [expiryDate, setExpiryDate] = useState("");
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  // use states for dropdowns
  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedRankValue, setSelectedRankValue] = useState(null);
  const [selectedStatusValue, setSelectedStatusValue] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  const [OfficerOffboardInfo, setOfficerOffboardInfo] = useState({
    verifiedAddress: "",
    nonce: Math.floor(Math.random() * 10000),
    name: "",
    legalNumber: "",
    badge: "",
    stateCode: "",
    branchId: "",
    rank: "",
    employmentStatus: "",
    signers: address,
    expiry: "",
    isOpen: true,
  });

  // const rankArray = ["Null", "Officer", "Detective", "Captain"];

  const statusArray = Array.from(employmentStatusMap).slice(-2);
  // const statusArray = ["Select a Status", "Fired", "Retired"];

  // handling inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOfficerOffboardInfo({ ...OfficerOffboardInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (OfficerOffboardInfo.verifiedAddress === "") {
      notify("error", `Verified Address is empty`);
    } else if (OfficerOffboardInfo.name === "") {
      notify("error", `Name is empty`);
    } else if (OfficerOffboardInfo.legalNumber === "") {
      notify("error", `Legal Number is empty`);
    } else if (OfficerOffboardInfo.badge === "") {
      notify("error", `Badge is empty`);
    } else if (OfficerOffboardInfo.stateCode === "") {
      notify("error", `State Code is empty`);
    } else if (OfficerOffboardInfo.branchId === "") {
      notify("error", `Branch Id is empty`);
    } else if (
      OfficerOffboardInfo.rank === "" ||
      OfficerOffboardInfo.rank === 0
    ) {
      notify("error", `Select Officer Rank`);
    } else if (
      OfficerOffboardInfo.employmentStatus === "" ||
      OfficerOffboardInfo.employmentStatus === 0
    ) {
      notify("error", `Select Employment Status`);
    } else if (OfficerOffboardInfo.expiry === "") {
      notify("error", `Select an Expiry Date`);
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);

      const client = await getWalletClient({ account, connector });

      const branchId = keccakString(OfficerOffboardInfo.branchId)

      const badge = keccakString(OfficerOffboardInfo.badge)

      const legalNumber = keccakInt(OfficerOffboardInfo.legalNumber)
  
      try {
        const hash = officerOffboardHash (
          OfficerOffboardInfo.verifiedAddress,
          OfficerOffboardInfo.nonce,
          OfficerOffboardInfo.name,
          legalNumber,
          badge,
          branchId,
          OfficerOffboardInfo.employmentStatus,
          OfficerOffboardInfo.rank,
          OfficerOffboardInfo.expiry
        )
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
            "http://localhost:3000/create-request/officer-offboard", {
              OfficerOffboardInfo: OfficerOffboardInfo,
              signature: signature
            }
          )
          .then((res) =>
            notify("success", "Officer Offboard Request Created successfully")
          )
          .catch((err) => {
            // console.log("error:: ", err);
            notify(
              "error",
              `An Error Occured when Creating Officer Offboard Request1`
            );
          });
      } catch (err) {
        console.log("Error message:: ", err.message);
        notify("error", `An Error Occured when Creating Officer Offboard Request`);
      }
    }
  };

  // Function to handle state code dropdown selection
  const handleStateCodeDropdownSelect = (categoryValue) => {
    setSelectedStateCode(categoryValue);
    const name = "stateCode";
    setOfficerOffboardInfo({ ...OfficerOffboardInfo, [name]: categoryValue });
  };

  // Function to handle dropdown item selection
  const handleRankDropdownSelect = (categoryValue) => {
    setSelectedRankValue(categoryValue);
    console.log("rank :: ", categoryValue);
    const name = "rank";
    setOfficerOffboardInfo({ ...OfficerOffboardInfo, [name]: categoryValue });
  };

  // Function to handle employment status dropdown selection
  const handleStatusDropdownSelect = (categoryValue) => {
    setSelectedStatusValue(categoryValue);
    const name = "employmentStatus";
    setOfficerOffboardInfo({ ...OfficerOffboardInfo, [name]: categoryValue });
    console.log("params :: ", name);
    console.log("value :: ", categoryValue);
  };

  // Function to handle branch id dropdown selection
  const handleBranchIdDropdownSelect = (categoryValue) => {
    setSelectedBranchId(categoryValue);
    const name = "branchId";
    setOfficerOffboardInfo({ ...OfficerOffboardInfo, [name]: categoryValue });
  };

  // handle date field only
  const handleDateChange = (fullDateTime) => {
    let unixTimestamp = moment(fullDateTime).unix();
    console.log("unixTimestamp:: ", unixTimestamp);
    setOfficerOffboardInfo({
      ...OfficerOffboardInfo,
      ["expiry"]: unixTimestamp,
    });
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
      <h2 className="m-3 mt-5 mb-4">Officer Offboard Request</h2>
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
              placeholder="Enter Precinct Address Here"
              className="form-control"
              onChange={handleChange}
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
              placeholder="Enter Name Here"
              className="form-control"
              onChange={handleChange}
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
              placeholder="Enter Legal Number Here"
              className="form-control"
              onChange={handleChange}
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
              placeholder="Enter Badge Here"
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

        {/* Officer Rank dropdown */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="officerRank" className="col-form-label">
              <b>
                <em>Officer Rank:</em>
              </b>
            </label>
          </div>

          <div className="col-9">
            <Dropdown>
              <Dropdown.Toggle
                variant="secondary"
                id="rank"
                className="dropdown"
              >
                {" "}
                {selectedRankValue
                  ? rankMap.get(selectedRankValue)
                  : "Select a Rank"}{" "}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {Array.from(rankMap).map(([key, value]) => (
                  <Dropdown.Item
                    name="rank"
                    key={key}
                    onClick={() => handleRankDropdownSelect(key)}
                  >
                    {" "}
                    {value}{" "}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
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
            <Dropdown>
              <Dropdown.Toggle
                variant="secondary"
                id="employmentStatus"
                className="dropdown"
              >
                {" "}
                {selectedStatusValue
                  ? employmentStatusMap.get(selectedStatusValue)
                  : "Select Status"}{" "}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {statusArray.map(([key, value]) => (
                  <Dropdown.Item
                    name="category"
                    key={key}
                    onClick={() => handleStatusDropdownSelect(key)}
                  >
                    {" "}
                    {value}{" "}
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

        {/* Submit button */}
        <button
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
          type="submit"
          onClick={async (e) => await handleSubmit(e)}
          disabled={isButtonDisabled}
        >
          Create Request for officer Offboarding
        </button>
      </form>
    </div>
  );
};
