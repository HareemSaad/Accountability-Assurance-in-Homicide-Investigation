import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import "./createRequests.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

export const TransferCase = () => {
  let navigate = useNavigate();

  const [expiryDate, setExpiryDate] = useState("");
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const [transferCaseInfo, setTransferCaseInfo] = useState({
    fromCaptain: "",
    toCaptain: "",
    caseId: "",
    fromBranchId: "",
    toBranchId: "",
    expiry: "",
    isOpen: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransferCaseInfo({ ...transferCaseInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (transferCaseInfo.fromCaptain === "") {
      notify("error", `From Captain is empty`);
    } else if (transferCaseInfo.toCaptain === "") {
      notify("error", `To Captain is empty`);
    } else if (transferCaseInfo.caseId === "") {
      notify("error", `Case Id is empty`);
    } else if (transferCaseInfo.toBranchId === "") {
      notify("error", `To Branch Id is empty`);
    } else if (transferCaseInfo.fromBranchId === "") {
      notify("error", `From Branch Id is empty`);
    } else if (transferCaseInfo.expiry === "") {
      notify("error", `Select an Expiry Date`);
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);
      axios
        .post(
          "http://localhost:3000/create-request/transfer-case",
          transferCaseInfo
        )
        .then((res) =>
          notify("success", "Transfer Case Request Created successfully")
        )
        .catch((err) => {
          // console.log("error:: ", err);
          notify(
            "error",
            `An Error Occured when Creating Transfer Case Request`
          );
        });
    }
  };

  // handle date field only
  const handleDateChange = (fullDateTime) => {
    let unixTimestamp = moment(fullDateTime).unix();
    console.log("unixTimestamp:: ", unixTimestamp);
    setTransferCaseInfo({ ...transferCaseInfo, ["expiry"]: unixTimestamp });
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
      <h2 className="m-3 mt-5 mb-4">Transfer Case Request</h2>
      <form>
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
              placeholder="Case Id Here"
              className="form-control"
              onChange={handleChange}
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
              type="number"
              name="toBranchId"
              id="toBranchId"
              placeholder="To Branch Id Here"
              className="form-control"
              onChange={handleChange}
            ></input>
          </div>
        </div>

        {/* From Branch Id */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="fromBranchId" className="col-form-label">
              <b>
                <em>From Branch Id:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="number"
              name="fromBranchId"
              id="fromBranchId"
              placeholder="From Branch Id Here"
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

        {/* Submit button */}
        <button
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
          type="submit"
          onClick={async (e) => await handleSubmit(e)}
          disabled={isButtonDisabled}
        >
          Create Request for Transfer Case
        </button>
      </form>
    </div>
  );
};
