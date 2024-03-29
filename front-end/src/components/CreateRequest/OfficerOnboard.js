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
import { rankMap } from "../data/data.js";
import { branchIdMap } from "../data/data.js";
import { getUserStateCode } from "../utils/queries/getUserStateCode.js";
import { onboardHash } from "../utils/hashing/onboardHash.js";
import { toLedgerTypedDataHash } from "../utils/hashing/ledgerDomainHash.js";
import "./createRequests.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { keccakInt, keccakString } from "../utils/hashing/keccak-hash.js";
import { getBranchByStateCode } from "../utils/queries/getBranchByStateCode.js";

export const OfficerOnboard = () => {
  let navigate = useNavigate();

  const { address, connector, isConnected, account } = useAccount();
  const [expiryDate, setExpiryDate] = useState("");
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedRankValue, setSelectedRankValue] = useState(null);
  const [toCaptainStateCode, setToCaptainStateCode] = useState(null);
  const [isNewStateCode, setIsNewStateCode] = useState([null]);
  const [branches, setBranches] = React.useState([]);
  const [officerOnboardInfo, setOfficerOnboardInfo] = useState({
    verifiedAddress: "",
    name: "",
    legalNumber: "",
    badge: "",
    stateCode: 0,
    branchId: "",
    rank: "",
    employmentStatus: 1,
    expiry: "",
    signature: "",
    signers: address,
    isOpen: true,
    nonce: 0,
    precinctAddress: "",
    jurisdictionArea: 0
  });

  useEffect(() => {
    handleStateCodeSelect()
  }, [])

  useEffect(() => {
    getBranches()
  }, [officerOnboardInfo.stateCode])

  const getBranches = async () => {
    const branches = await getBranchByStateCode(officerOnboardInfo.stateCode);
    setBranches(branches)
    console.log("branches: ", branches, officerOnboardInfo.stateCode)
  }

  // Function to handle state code dropdown selection
  const handleStateCodeSelect = async () => {
    const value =  await getUserStateCode(address);
    const name = "stateCode";
    setOfficerOnboardInfo({ ...officerOnboardInfo, [name]: value });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOfficerOnboardInfo({ ...officerOnboardInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  };
  
  // Handler for checkbox change
  const handleBranchExistChange = (e) => {
    setIsNewStateCode(e.target.checked);
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
    } else if (officerOnboardInfo.stateCode === "") {
      notify("error", `State Code is empty`);
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
      officerOnboardInfo.nonce = Math.floor(Math.random() * 10000)
      console.log("nonce: ", officerOnboardInfo.nonce);

      const branchId = keccakString(officerOnboardInfo.branchId)

      const badge = keccakString(officerOnboardInfo.badge)

      const legalNumber = keccakInt(officerOnboardInfo.legalNumber)
  
      try {
        const hash = onboardHash (
          officerOnboardInfo.verifiedAddress,
          officerOnboardInfo.nonce,
          officerOnboardInfo.name,
          legalNumber,
          badge,
          officerOnboardInfo.branchId,
          officerOnboardInfo.employmentStatus,
          officerOnboardInfo.rank,
          officerOnboardInfo.expiry
        )

        // console.log("hash", hash)

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

        setOfficerOnboardInfo({...officerOnboardInfo, ['signature']: signature})
      
        if(officerOnboardInfo.rank === 1 || officerOnboardInfo.rank === 2) {
    
          // TODO: to add on add officers from captain side
          // const {txnHash} = await writeContract({
          //   address: process.env.REACT_APP_LEDGER_CONTRACT,
          //   abi: LedgerABI,
          //   functionName: 'onboard',
          //   args: [
          //     officerOnboardInfo.nonce,
          //     stateCode,
          //     officerOnboardInfo.verifiedAddress,
          //     officerOnboardInfo.name,
          //     legalNumber,
          //     badge,
          //     branchId,
          //     officerOnboardInfo.rank,
          //     officerOnboardInfo.expiry,
          //     signature,
          //     address
          //   ],
          //   account: address,
          //   chainId: 11155111
          // })
          // console.log("hash :: ", txnHash)

          // // wait for txn
          // const result = await waitForTransaction({
          //   hash: txnHash,
          // })
          // console.log("Transaction result:", result);

          // send request to db
          axios
            .post(
              "http://localhost:3000/create-request/officer-onboard",
              {
                "officerOnboardInfo": officerOnboardInfo, 
                "signatureOfficerOnboard": signature
              }
            )
            .then((res) =>
              notify("success", "Officer Onboard Request Created successfully")
            )
            .catch((err) => {
              // console.log("error:: ", err);
              notify(
                "error",
                `An Error Occured when Creating Officer Onboard Request`
              );
            });

        } else if(officerOnboardInfo.rank === 3) {
    
          const { hash } = await writeContract({
            address: process.env.REACT_APP_LEDGER_CONTRACT,
            abi: LedgerABI,
            functionName: 'onboardCaptain',
            args: [
              officerOnboardInfo.nonce,
              localStorage.getItem("statecode"),
              officerOnboardInfo.verifiedAddress,
              officerOnboardInfo.name,
              legalNumber,
              badge,
              officerOnboardInfo.branchId,
              officerOnboardInfo.expiry,
              signature,
              address
            ],
            account: address,
            chainId: 11155111
          })
          console.log("hash :: ", hash)

          // wait for txn
          const result = await waitForTransaction({
            hash: hash,
          })
          console.log("Transaction result:", result);
          notify("success", "Onboard Successful")

        } else if(officerOnboardInfo.rank === 4) {

          console.log(
            officerOnboardInfo.nonce,
            officerOnboardInfo.stateCode,
            localStorage.getItem("statecode"),
            officerOnboardInfo.verifiedAddress,
            officerOnboardInfo.name,
            legalNumber,
            badge,
            branchId,
            officerOnboardInfo.precinctAddress,
            officerOnboardInfo.jurisdictionArea,
            officerOnboardInfo.expiry,
            signature,
            address
          );
    
          const { hash } = await writeContract({
            address: process.env.REACT_APP_LEDGER_CONTRACT,
            abi: LedgerABI,
            functionName: 'addModerator',
            args: [
              officerOnboardInfo.nonce,
              officerOnboardInfo.stateCode,
              localStorage.getItem("statecode"),
              officerOnboardInfo.verifiedAddress,
              officerOnboardInfo.name,
              legalNumber,
              badge,
              officerOnboardInfo.branchId,
              officerOnboardInfo.precinctAddress,
              officerOnboardInfo.jurisdictionArea,
              officerOnboardInfo.expiry,
              signature,
              address
            ],
            account: address,
            chainId: 11155111
          })
          console.log("hash :: ", hash)

          // wait for txn
          const result = await waitForTransaction({
            hash: hash,
          })
          console.log("Transaction result:", result);
          notify("success", "Onboard Successful")
        }
      } catch(error) {
        console.log(error)
        notify(
          "error",
          `Error while sending transaction`
        );
      }
    }
  };

  // Function to handle state code dropdown selection
  const handleStateCodeDropdownSelect = (categoryValue) => {
    setSelectedStateCode(categoryValue);
    const name = "stateCode";
    setOfficerOnboardInfo({ ...officerOnboardInfo, [name]: categoryValue });
  }

  // Function to handle dropdown item selection
  const handleRankDropdownSelect = (categoryValue) => {
    setSelectedRankValue(categoryValue);
    const name = "rank";
    setOfficerOnboardInfo({ ...officerOnboardInfo, [name]: categoryValue });
  };

  // Function to handle branch id dropdown selection
  const handleBranchIdDropdownSelect = (id, title) => {
    setSelectedBranchId(title);
    const name = "branchId";
    setOfficerOnboardInfo({ ...officerOnboardInfo, [name]: id });
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

        {/* State Code */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="stateCode" className="col-form-label">
              <b>
                <em>State Code:</em>
              </b>
            </label>
          </div>
          {
            isNewStateCode && officerOnboardInfo.rank === 4 ? 
            <div className="col-9 input">
              <input
                type="number"
                name="stateCode"
                id="stateCode"
                placeholder="Enter State Code Here"
                className="form-control"
                onChange={handleChange}
              ></input>
            </div> :
            <div className="col-9 input">
              <input
                type="number"
                name="stateCode"
                id="stateCode"
                placeholder="Enter State Code Here"
                className="form-control"
                value={officerOnboardInfo.stateCode}
                disabled
              ></input>
            </div>
          }
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
          {
            officerOnboardInfo.rank === 4 ? 
            <div className="col-9 input">
              <input
                type="text"
                name="branchId"
                id="branchId"
                placeholder="Enter branch Id Here"
                className="form-control"
                onChange={handleChange}
              ></input>
            </div> :
            <div className="col-9 input">
              <Dropdown>
                <Dropdown.Toggle
                  id="branchId"
                  className="dropdown customBackground"
                >
                  {selectedBranchId ? selectedBranchId : "Select Branch Id"}
                </Dropdown.Toggle>
  
                <Dropdown.Menu className="dropdown selectDropdown">
                  {branches && branches.length > 0 ?
                  (branches.map((branch, index) => (
                    <Dropdown.Item
                      name="branchId"
                      key={index}
                      onClick={() => handleBranchIdDropdownSelect(branch.id, branch.title)}
                    >
                      {`${branch.title} `}
                    </Dropdown.Item>
                  ))
                  ) : (
                    <Dropdown.Item disabled>Loading branches...</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          }
        </div>

        {/* Precinct address*/}
        {isNewStateCode && selectedRankValue === 4 && (
          <div>
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
          </div>
        )}

        {/* Officer Rank */}
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
                id="rank"
                className="dropdown customBackground"
              >
                {" "}
                {selectedRankValue
                  ? rankMap.get(selectedRankValue)
                  : "Select a Rank"}{" "}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown selectDropdown">
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

        {/* isNewStateCode Checkbox */}
        <div className="form-check form-switch container d-flex justify-content-center mt-5">
          <input
            className="form-check-input input me-2"
            type="checkbox"
            role="switch"
            id="isNewStateCode"
            checked={isNewStateCode}
            onChange={handleBranchExistChange}
          />
          <label className="form-check-label" htmlFor="isNewStateCode">New Statecode?</label>
        </div>

        {/* Submit button */}
        <button
          className="btn btn-primary d-grid gap-2 col-4 mx-auto mt-4 mb-5 p-2 btn-background"
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
