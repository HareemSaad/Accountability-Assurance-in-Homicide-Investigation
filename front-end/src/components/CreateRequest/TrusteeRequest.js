import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./createRequests.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { stateCodeMap, branchIdMap } from "../data/data.js";
import Dropdown from "react-bootstrap/Dropdown";
import { useAccount } from 'wagmi'
import { client } from "../data/data.js";
import { caseStatusTypeMap } from "../data/data.js";

export const TrusteeRequest = () => {
  let navigate = useNavigate();
  const { address } = useAccount();

  const [expiryDate, setExpiryDate] = useState("");
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [trusteeRequestInfo, setTrusteeRequestInfo] = useState({
    caseId: "",
    trustee: "",
    moderator: "",
    captain: address,
    stateCode: "",
    branchId: "",
    expiry: "",
    isOpen: true,
  });
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState(0);
  
  useEffect(() => {
      fetchData();
  }, [cases]);

  async function fetchData() {
      const query = `
      {
          officer(id: "${address}") {
            cases {
              id
              status
            }
          }
      }
      `;
      const response = await client.query(query).toPromise();
      const { data } = response;
      console.log(data.officer.cases);
      setCases(data.officer.cases);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrusteeRequestInfo({ ...trusteeRequestInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (caseId === "") {
      notify("error", `Case Id is empty`);
    } else if (trusteeRequestInfo.trustee === "") {
      notify("error", `Trustee Address is empty`);
    } else if (trusteeRequestInfo.moderator === "") {
      notify("error", `Moderator Address is empty`);
    } else if (trusteeRequestInfo.stateCode === "") {
      notify("error", `State Code is empty`);
    } else if (trusteeRequestInfo.branchId === "") {
      notify("error", `Branch Id is empty`);
    } else if (trusteeRequestInfo.expiry === "") {
      notify("error", `Select an Expiry Date`);
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);
      trusteeRequestInfo.caseId = caseId;
      axios
        .post(
          "http://localhost:3000/create-request/trustee-request",
          trusteeRequestInfo
        )
        .then((res) =>
          notify("success", "Trustee Request Created successfully")
        )
        .catch((err) => {
          // console.log("error:: ", err);
          notify("error", `An Error Occured when Creating Trustee Request`);
        });
    }
  };

  // Function to handle state code dropdown selection
  const handleStateCodeDropdownSelect = (categoryValue) => {
    setSelectedStateCode(categoryValue);
    const name = "stateCode";
    setTrusteeRequestInfo({ ...trusteeRequestInfo, [name]: categoryValue });
  }

  // Function to handle branch id dropdown selection
  const handleBranchIdDropdownSelect = (categoryValue) => {
    setSelectedBranchId(categoryValue);
    const name = "branchId";
    setTrusteeRequestInfo({ ...trusteeRequestInfo, [name]: categoryValue });
  }

  // handle date field only
  const handleDateChange = (fullDateTime) => {
    let unixTimestamp = moment(fullDateTime).unix();
    console.log("unixTimestamp:: ", unixTimestamp);
    setTrusteeRequestInfo({ ...trusteeRequestInfo, ["expiry"]: unixTimestamp });
  };

  // Function to handle dropdown item selection
  const handleDropdownSelect = async (value) => {
    setCaseId(value);
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
      <h2 className="m-3 mt-5 mb-4">Trustee Request</h2>
      <form>

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
            <Dropdown>
            <Dropdown.Toggle id="rank" className="dropdown customBackground">
                {/* {selectedValue ? rankMap.get(selectedValue) : "Select Rank"} */}
                {caseId ? (caseId) : "Select a Case"}
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown selectDropdown">
            {cases.length > 0 ? (
                cases.map(element => (
                    <Dropdown.Item key={element.id} name="rank" onClick={() => handleDropdownSelect(element.id)}>
                        {`${element.id} (${caseStatusTypeMap[element.status]})`}
                    </Dropdown.Item>
                ))
            ) : (
                <Dropdown.Item disabled>Loading officers...</Dropdown.Item>
            )}
            </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Trustee */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="trusteeAddress" className="col-form-label">
              <b>
                <em>Trustee Address:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="trustee"
              id="trustee"
              placeholder="Enter Trustee Here"
              className="form-control"
              onChange={handleChange}
            ></input>
          </div>
        </div>

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
              placeholder="Moderator Address Here"
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
              <Dropdown.Toggle id="stateCode" className="dropdown customBackground">
                {selectedStateCode ? stateCodeMap.get(selectedStateCode) : "Select State Code"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown selectDropdown">
                {Array.from(stateCodeMap).map(([key, value]) => (
                  <Dropdown.Item name="stateCode" key={key} onClick={() => handleStateCodeDropdownSelect(key)} >
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
              <Dropdown.Toggle id="branchId" className="dropdown customBackground">
                {selectedBranchId ? branchIdMap.get(selectedBranchId) : "Select Branch Id"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown selectDropdown">
                {Array.from(branchIdMap).map(([key, value]) => (
                  <Dropdown.Item name="branchId" key={key} onClick={() => handleBranchIdDropdownSelect(key)} >
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
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
          type="submit"
          onClick={async (e) => await handleSubmit(e)}
          disabled={isButtonDisabled}
        >
          Create Trustee Request
        </button>
      </form>
    </div>
  );
};
