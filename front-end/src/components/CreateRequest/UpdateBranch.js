import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export const UpdateBranch = () => {
  let navigate = useNavigate();
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const [updateBranchInfo, setUpdateBranchInfo] = useState({
    precinctAddress: "",
    jurisdictionArea: "",
    stateCode: "",
    branchId: "",
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
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);
      
      axios
        .post(
          "http://localhost:3000/create-request/update-branch",
          updateBranchInfo
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
    }
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
              type="text"
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
