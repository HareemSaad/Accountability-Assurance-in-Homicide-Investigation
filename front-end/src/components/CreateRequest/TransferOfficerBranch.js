import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";

export const TransferOfficerBranch = () => {
  let navigate = useNavigate();

  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [selectedRankValue, setSelectedRankValue] = useState(null);
  // const [employeeStatus, setEmployeeStatus] = useState("");

  // Function to handle dropdown item selection
  const [selectedStatusValue, setSelectedStatusValue] = useState(null);

  const [transferOfficerInfo, setTransferOfficerInfo] = useState({
    verifiedAddress: "",
    name: "",
    legalNumber: "",
    badge: "",
    branchId: "",
    toBranchId: "",
    rank: "",
    employmentStatus: "",
  });

  const rankArray = ["Null", "Officer", "Detective", "Captain"];
  const statusArray = [
    "Select a Status",
    "Active",
    "Inactive",
    "Fired",
    "Retired",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransferOfficerInfo({ ...transferOfficerInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (transferOfficerInfo.verifiedAddress === "") {
      notify("error", `Verified Address is empty`);
    } else if (transferOfficerInfo.name === "") {
      notify("error", `Name is empty`);
    } else if (transferOfficerInfo.legalNumber === "") {
      notify("error", `Legal Number is empty`);
    } else if (transferOfficerInfo.badge === "") {
      notify("error", `Badge is empty`);
    } else if (transferOfficerInfo.branchId === "") {
      notify("error", `Branch Id is empty`);
    } else if (transferOfficerInfo.toBranchId === "") {
      notify("error", `To Branch Id is empty`);
    } else if (
      transferOfficerInfo.rank === "" ||
      transferOfficerInfo.rank === 0
    ) {
      notify("error", `Select Officer Rank`);
    } else if (
      transferOfficerInfo.employmentStatus === "" ||
      transferOfficerInfo.employmentStatus === 0
    ) {
      notify("error", `Select Employment Status`);
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);
      axios
        .post(
          "http://localhost:3000/create-request/transfer-officer-branch",
          transferOfficerInfo
        )
        .then((res) =>
          notify("success", "Update Officer Request Created successfully")
        )
        .catch((err) => {
          // console.log("error:: ", err);
          notify(
            "error",
            `An Error Occured when Creating Update Officer Request`
          );
        });
    }
  };

  useEffect(() => {
    console.log("transferOfficerInfo:: ", transferOfficerInfo);
  }, [transferOfficerInfo]);

  // Function to handle rank dropdown item selection
  const handleRankDropdownSelect = (categoryValue) => {
    setSelectedRankValue(categoryValue);
    const name = "rank";
    setTransferOfficerInfo({ ...transferOfficerInfo, [name]: categoryValue});
  };

  // Function to handle employment status dropdown selection
  const handleStatusDropdownSelect = (categoryValue) => {
    setSelectedStatusValue(categoryValue);
    const name = "employmentStatus";
    setTransferOfficerInfo({ ...transferOfficerInfo, [name]: categoryValue });
  };

  return (
    <div className="container">
      <h2 className="m-3 mt-5 mb-4">Transfer Officer Request</h2>
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
              type="number"
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
            <input
              type="number"
              name="branchId"
              id="branchId"
              placeholder="Enter Branch Id Here"
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
              placeholder="Enter To Branch Id Here"
              className="form-control"
              onChange={handleChange}
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

          <div className="col-9">
            <Dropdown>
              <Dropdown.Toggle
                variant="secondary"
                id="officerRank"
                className="dropdown"
              >
                {" "}
                {selectedRankValue
                  ? rankArray[selectedRankValue]
                  : "Select a Rank"}{" "}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {rankArray.map((category, index) => (
                  <Dropdown.Item
                    name="rank"
                    key={index}
                    onClick={() => handleRankDropdownSelect(index)}
                  >
                    {" "}
                    {category}{" "}
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
                  ? statusArray[selectedStatusValue]
                  : "Select Status"}{" "}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {statusArray.map((status, index) => (
                  <Dropdown.Item
                    name="category"
                    key={index}
                    onClick={() => handleStatusDropdownSelect(index)}
                  >
                    {" "}
                    {status}{" "}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Submit button */}
        <button
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
          type="submit"
          onClick={async (e) => await handleSubmit(e)}
          disabled={isButtonDisabled}
        >
          Create Request for Transfer Officer Branch
        </button>
      </form>
    </div>
  );
};
