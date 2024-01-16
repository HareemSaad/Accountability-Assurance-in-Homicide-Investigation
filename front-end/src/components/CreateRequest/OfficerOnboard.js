import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from 'ethers';
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import { writeContract, waitForTransaction, getWalletClient } from '@wagmi/core'
import { useAccount } from 'wagmi'
import LedgerABI from "./../Ledger.json";
import axios from "axios";
import { employmentStatusMap, rankMap } from "../data/data.js";
import { stateCodeMap, branchIdMap } from "../data/data.js";
import { onboardHash } from "../utils/hashing/onboardHash.js";
import { toLedgerTypedDataHash } from "../utils/hashing/ledgerDomainHash.js";
import "./createRequests.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

export const OfficerOnboard = () => {
  let navigate = useNavigate();

  const { address, connector, isConnected, account } = useAccount();
  const [expiryDate, setExpiryDate] = useState("");
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedRankValue, setSelectedRankValue] = useState(null);
  const [officerOnboardInfo, setOfficerOnboardInfo] = useState({
    verifiedAddress: "",
    name: "",
    legalNumber: "",
    badge: "",
    branchId: "",
    rank: "",
    employmentStatus: 1,
    expiry: "",
    isOpen: true,
  });

  // const rankArray = ["Null", "Officer", "Detective", "Captain"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOfficerOnboardInfo({ ...officerOnboardInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (officerOnboardInfo.verifiedAddress === "") {
      notify("error", `Verified Address is empty`);
    } else if (officerOnboardInfo.name === "") {
      notify("error", `Name is empty`);
    } else if (officerOnboardInfo.legalNumber === "") {
      notify("error", `Legal Number is empty`);
    } else if (officerOnboardInfo.badge === "") {
      notify("error", `Badge is empty`);
    } else if (officerOnboardInfo.branchId === "") {
      notify("error", `Branch Id is empty`);
    } else if (
      officerOnboardInfo.rank === "" ||
      officerOnboardInfo.rank === 0
    ) {
      notify("error", `Select Officer Rank`);
    } else if (officerOnboardInfo.expiry === "") {
      notify("error", `Select an Expiry Date`);
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);
      const client = await getWalletClient({ account, connector })

      // TODO: get from global
      // const nonce = await provider.getTransactionCount(address);
      const nonce = 140

      const branchId = ethers.utils.hexlify(ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [officerOnboardInfo.branchId])
      ));

      const badge = ethers.utils.hexlify(ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [officerOnboardInfo.badge])
      ));

      const legalNumber = ethers.utils.hexlify(ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [officerOnboardInfo.legalNumber])
      ));

      if(officerOnboardInfo.rank === 3) {
  
        const hash = onboardHash (
          officerOnboardInfo.verifiedAddress,
          nonce,
          officerOnboardInfo.name,
          legalNumber,
          badge,
          branchId,
          officerOnboardInfo.employmentStatus,
          officerOnboardInfo.rank,
          officerOnboardInfo.expiry
        )
  
        const message = toLedgerTypedDataHash(
          hash
        )

        const signature = await client.request(
          {
            method: 'eth_sign',
            params: [
              address,
              message 
            ],
          },
          { retryCount: 0 },
        )
  
        const {txnHash} = await writeContract({
          address: process.env.REACT_APP_LEDGER_CONTRACT,
          abi: LedgerABI,
          functionName: 'onboardCaptain',
          args: [
            nonce,
            8888, //TODO: change to dynamic statecode
            officerOnboardInfo.verifiedAddress,
            officerOnboardInfo.name,
            legalNumber,
            badge,
            branchId,
            officerOnboardInfo.expiry,
            signature,
            address
          ],
          account: address,
          chainId: 11155111
        })
        console.log("hash :: ", txnHash)

        // wait for txn
        const result = await waitForTransaction({
          hash: txnHash,
        })
        console.log("Transaction result:", result);

      }
      // axios
      //   .post(
      //     "http://localhost:3000/create-request/officer-onboard",
      //     officerOnboardInfo
      //   )
      //   .then((res) =>
      //     notify("success", "Officer Onboard Request Created successfully")
      //   )
      //   .catch((err) => {
      //     // console.log("error:: ", err);
      //     notify(
      //       "error",
      //       `An Error Occured when Creating Officer Onboard Request`
      //     );
      //   });
    }
  };

  // Function to handle dropdown item selection
  const handleRankDropdownSelect = (categoryValue) => {
    setSelectedRankValue(categoryValue);
    const name = "rank";
    setOfficerOnboardInfo({ ...officerOnboardInfo, [name]: categoryValue });
  };

  // Function to handle branch id dropdown selection
  const handleBranchIdDropdownSelect = (categoryValue) => {
    setSelectedBranchId(categoryValue);
    const name = "branchId";
    setOfficerOnboardInfo({ ...officerOnboardInfo, [name]: categoryValue });
  }

  // handle date field only
  const handleDateChange = (fullDateTime) => {
    let unixTimestamp = moment(fullDateTime).unix();
    console.log("unixTimestamp:: ", unixTimestamp);
    setOfficerOnboardInfo({ ...officerOnboardInfo, ["expiry"]: unixTimestamp });
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
      <h2 className="m-3 mt-5 mb-4">Officer Onboard</h2>
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
              <Dropdown.Toggle variant="secondary" id="branchId" className="dropdown">
                {selectedBranchId ? branchIdMap.get(selectedBranchId) : "Select Branch Id"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {Array.from(branchIdMap).map(([key, value]) => (
                  <Dropdown.Item name="branchId" key={key} onClick={() => handleBranchIdDropdownSelect(key)} >
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
            <input
              type="text"
              name="employmentStatus"
              id="employmentStatus"
              className="form-control"
              value="Active"
              disabled
            />
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
          Create Request for officer Onboarding
        </button>
      </form>
    </div>
  );
};
