import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import { stateCodeMap, branchIdMap } from "../data/data.js";
import "./createRequests.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { useAccount } from "wagmi";
import { client } from "../data/data";

export const TransferCaptain = () => {
  // const { caseId } = useParams();
  let navigate = useNavigate();
  const { address, connector, isConnected, account } = useAccount();

  const [expiryDate, setExpiryDate] = useState("");
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [transferCaptainInfo, setTransferCaptainInfo] = useState({
    moderator: address,
    fromCaptain: "",
    toCaptain: "",
    stateCode: localStorage.getItem("statecode"),
    branchId: "",
    nonce: Math.floor(Math.random() * 10000),
    caseId: "",
    receiver: false,
    expiry: "",
    isOpen: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransferCaptainInfo({ ...transferCaptainInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  };

  async function fetchStateCode() {
    const query = `
    {
      officer(id: "${transferCaptainInfo.fromCaptain}") {
        branch {
          stateCode
        }
      }
    }
    `;
    const response = await client.query(query).toPromise();
    const { data, fetching, error } = response;
    console.log("subgraph data: ", data);
    if (data.officer === null) {
      console.log("first")
      return -1;
    }
    else {
      return data.officer.branch.stateCode;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (transferCaptainInfo.moderator === "") {
      notify("error", `Moderator Address is empty`);
    } else if (transferCaptainInfo.fromCaptain === "") {
      notify("error", `From Captain is empty`);
    } else if (transferCaptainInfo.toCaptain === "") {
      notify("error", `To Captain is empty`);
    } else if (transferCaptainInfo.stateCode === "") {
      notify("error", `State Code is empty`);
    } else if (transferCaptainInfo.branchId === "") {
      notify("error", `Branch Id is empty`);
    } else if (transferCaptainInfo.caseId === "") {
      notify("error", `Case Id is empty`);
    } else if (transferCaptainInfo.expiry === "") {
      notify("error", `Select an Expiry Date`);
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);

      const stateCodeFromCaptain = await fetchStateCode();

      if (transferCaptainInfo.stateCode === stateCodeFromCaptain) {
        axios
          .post(
            "http://localhost:3000/create-request/transfer-captain/:caseId",
            transferCaptainInfo,
          )
          .then((res) =>
            notify("success", "Transfer Captain Request Created successfully")
          )
          .catch((err) => {
            // console.log("error:: ", err);
            notify(
              "error",
              `An Error Occured when Creating Transfer Captain Request`
            );
          });
      } else if (stateCodeFromCaptain === -1){
        notify(
          "error",
          `From Captain doesn't exist.`
        );
      } else {
        notify(
          "error",
          `Invalid From Captain address! Modarator and From Captain state code is Different.`
        );
      } 
      // } catch (err) {
      //   console.log("Error:: ", err);
      // }
    }
  };

  // Function to handle state code dropdown selection
  const handleStateCodeDropdownSelect = (categoryValue) => {
    setSelectedStateCode(categoryValue);
    const name = "stateCode";
    setTransferCaptainInfo({ ...transferCaptainInfo, [name]: categoryValue });
  };

  // Function to handle branch id dropdown selection
  const handleBranchIdDropdownSelect = (categoryValue) => {
    setSelectedBranchId(categoryValue);
    const name = "branchId";
    setTransferCaptainInfo({ ...transferCaptainInfo, [name]: categoryValue });
  };

  // handle date field only
  const handleDateChange = (fullDateTime) => {
    let unixTimestamp = moment(fullDateTime).unix();
    console.log("unixTimestamp:: ", unixTimestamp);
    setTransferCaptainInfo({
      ...transferCaptainInfo,
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
      <h2 className="m-3 mt-5 mb-4">Transfer Captain Request</h2>
      <form>
        {/* Moderator Address */}
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
              value={address}
              disabled="true"
              className="form-control"
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
              placeholder="From Captain Address Here"
              className="form-control"
              onChange={handleChange}
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
              placeholder="To Captain Address Here"
              className="form-control"
              onChange={handleChange}
            ></input>
          </div>
        </div>

        {/* State Code */}
        {/* <div className="row g-3 align-items-center m-3">
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
        </div> */}

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
                id="branchId"
                className="dropdown customBackground"
              >
                {selectedBranchId
                  ? branchIdMap.get(selectedBranchId)
                  : "Select Branch Id"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown selectDropdown">
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

        {/* caseId */}
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
              placeholder="Case Id Here"
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

        {/* Submit button */}
        <button
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
          type="submit"
          onClick={async (e) => await handleSubmit(e)}
          disabled={isButtonDisabled}
        >
          Create Request for Transfer Captain
        </button>
      </form>
    </div>
  );
};
