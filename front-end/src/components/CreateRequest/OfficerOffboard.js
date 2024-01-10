import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";

export const OfficerOffboard = () => {
  let navigate = useNavigate();

  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [selectedRankValue, setSelectedRankValue] = useState(null);
  // Function to handle dropdown item selection
  const [selectedStatusValue, setSelectedStatusValue] = useState(null);
  const [OfficerOffboardInfo, setOfficerOffboardInfo] = useState({
    verifiedAddress: "",
    name: "",
    legalNumber: "",
    badge: "",
    branchId: "",
    rank: "",
    employmentStatus: "",
  });

  const rankArray = ["Null", "Officer", "Detective", "Captain"];
  const statusArray = ["Select a Status", "Fired", "Retired"];

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
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);
      axios
        .post(
          "http://localhost:3000/create-request/officer-offboard",
          OfficerOffboardInfo
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
    }
  };

  // Function to handle dropdown item selection
  const handleDropdownSelect = (categoryValue) => {
    setSelectedRankValue(categoryValue);
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
                  ? rankArray[selectedRankValue]
                  : "Select a Rank"}{" "}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {rankArray.map((category, index) => (
                  <Dropdown.Item
                    name="rank"
                    key={index}
                    onClick={() => handleDropdownSelect(index)}
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
          Create Request for officer Onboarding
        </button>
      </form>
    </div>
  );
};
