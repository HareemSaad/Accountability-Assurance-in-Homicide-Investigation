import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import './../AddDropOfficer/officer.css';
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import { stateCodeMap, employmentStatusMap, rankMap, branchIdMap } from "../data/data.js";
import "./createRequests.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { client } from "../data/data";

export const TransferOfficerBranch = () => {
  let navigate = useNavigate();

  const [expiryDate, setExpiryDate] = useState("");
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  // const [selectedRankValue, setSelectedRankValue] = useState(null);
  // const [employeeStatus, setEmployeeStatus] = useState("");

  // Function to handle dropdown item selection
  // const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedVerifiedAddress, setSelectedVerifiedAddress] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  const [selectedToCaptain, setSelectedToCaptain] = useState(null)
  const [selectedToCaptainName, setSelectedToCaptainName] = useState(null)
  
  const [selectedFromCaptain, setSelectedFromCaptain] = useState(null)
  const [selectedFromCaptainName, setSelectedFromCaptainName] = useState(null)
  
  // const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedPrecinctAddress, setSelectedPrecinctAddress] = useState(null)
  const [selectedToBranchId, setSelectedToBranchId] = useState(null);
  // const [selectedStatusValue, setSelectedStatusValue] = useState(null);

  const [transferOfficerInfo, setTransferOfficerInfo] = useState({
    verifiedAddress: "",
    nonce: Math.floor(Math.random() * 10000),
    fromCaptain: "",
    toCaptain: "",
    stateCode: localStorage.getItem("statecode"),
    toBranchId: "",
    receiver: false,
    expiry: "",
    isOpen: true,
  });

  const statusArray = Array.from(employmentStatusMap).slice(0, 2);

  const [officers, setOfficers] = useState([]);
  const [Captains, setCaptains] = useState([]);
  const [Branches, setBranches] = useState([]);

  useEffect(() => {
    // console.log("officers:: ", officers);
    // console.log("Captains:: ", Captains);
    console.log("transferOfficerInfo:: ", transferOfficerInfo);
    fetchData();
    fetchCaptain();
    fetchBranch();
  }, [officers, transferOfficerInfo]);

  async function fetchData() {
    const query = `
      {
        officers(where: {branch_: {stateCode: "${transferOfficerInfo.stateCode}"}, employmentStatus: 1, rank_lt: 3}) {
          name
          id
          rank
        }
      }
    `;
    const response = await client.query(query).toPromise();
    const { data } = response;
    // console.log("data:: ", data.officers);
    setOfficers(data.officers);
  }
  
  async function fetchCaptain() {
    const query = `
      {
        officers(where: {branch_: {stateCode: "${transferOfficerInfo.stateCode}"}, employmentStatus: 1, rank: 3}) {
          name
          id
          rank
        }
      }
    `;
    const response = await client.query(query).toPromise();
    const { data } = response;
    // console.log("dataCaptain:: ", data.officers);
    setCaptains(data.officers);
  }
  
  async function fetchBranch() {
    const query = `
    {
      branchUpdates(where: {stateCode: "${transferOfficerInfo.stateCode}"}) {
        id
        precinctAddress
        jurisdictionArea
      }
    }
    `;
    const response = await client.query(query).toPromise();
    const { data } = response;
    console.log("dataBranch:: ", data.branchUpdates);
    setBranches(data.branchUpdates);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransferOfficerInfo({ ...transferOfficerInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  };

  async function fetchStateCode() {
    const query = `
    {
      officer(id: "${transferOfficerInfo.fromCaptain}") {
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
      return 90;
    }
    else {
      return data.officer.branch.stateCode;
    }
  }

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
    } else if (transferOfficerInfo.stateCode === "") {
      notify("error", `State Code is empty`);
    } else if (transferOfficerInfo.branchId === "") {
      notify("error", `Branch Id is empty`);
    } else if (transferOfficerInfo.toBranchId === "") {
      notify("error", `To Branch Id is empty`);
    } else if (
      transferOfficerInfo.rank === "" ||
      transferOfficerInfo.rank === 0
    ) {
      notify("error", `Select Officer Rank`);
    } else if (transferOfficerInfo.employmentStatus === "") {
      notify("error", `Select Employment Status`);
    } else if (transferOfficerInfo.expiry === "") {
      notify("error", `Select an Expiry Date`);
    } else {
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);

      const stateCodeFromCaptain = await fetchStateCode();
      
      if (transferOfficerInfo.stateCode === stateCodeFromCaptain) {
      axios
        .post(
          "http://localhost:3000/create-request/transfer-officer-branch",
          transferOfficerInfo
        )
        .then((res) =>
          notify("success", "Transfer Officer Branch Request Created successfully")
        )
        .catch((err) => {
          // console.log("error:: ", err);
          notify(
            "error",
            `An Error Occured when Creating Transfer Officer Branch Request`
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
    }
  };

  const handleVerifiedAddressSelect = (userVerifiedAddress, userName, userRank) => {
    setSelectedVerifiedAddress(userVerifiedAddress);
    setSelectedName(userName);
    const name = "verifiedAddress";
    setTransferOfficerInfo({ ...transferOfficerInfo, [name]: userVerifiedAddress});
  };

  // Function to handle from captain dropdown selection
  const handleFromCaptainSelect = (userFromCaptain, fromCaptainName) => {
    setSelectedFromCaptain(userFromCaptain);
    setSelectedFromCaptainName(fromCaptainName);
    const name = "fromCaptain";
    setTransferOfficerInfo({ ...transferOfficerInfo, [name]: userFromCaptain});
  };
  // Function to handle to captain dropdown selection
  const handleToCaptainSelect = (userToCaptain, toCaptainName) => {
    setSelectedToCaptain(userToCaptain);
    setSelectedToCaptainName(toCaptainName);
    const name = "toCaptain";
    setTransferOfficerInfo({ ...transferOfficerInfo, [name]: userToCaptain});
  };

  // Function to handle to branch id dropdown selection
  const handleToBranchIdDropdownSelect = (categoryValue, userPrecinctAddress) => {
    setSelectedToBranchId(categoryValue);
    setSelectedPrecinctAddress(userPrecinctAddress);
    const name = "toBranchId";
    setTransferOfficerInfo({ ...transferOfficerInfo, [name]: categoryValue });
  }

  // handle date field only
  const handleDateChange = (fullDateTime) => {
    let unixTimestamp = moment(fullDateTime).unix();
    console.log("unixTimestamp:: ", unixTimestamp);
    setTransferOfficerInfo({ ...transferOfficerInfo, ["expiry"]: unixTimestamp });
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
          <Dropdown>
              <Dropdown.Toggle
                id="verifiedAddress"
                className="dropdown customBackground"
              >
                {selectedName ? selectedName : "Select Verified Address"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown selectDropdown">
                {officers.length > 0 ?
                (officers.map((officer, index) => (
                  <Dropdown.Item
                    name="verifiedAddress"
                    key={index}
                    onClick={() => handleVerifiedAddressSelect(officer.id, officer.name)}
                  >
                    {`${officer.name} (${rankMap.get(officer.rank)}) - ${officer.id}`}
                  </Dropdown.Item>
                ))
                ) : (
                  <Dropdown.Item disabled>Loading officers...</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
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
          <Dropdown>
              <Dropdown.Toggle
                // variant="secondary"
                id="fromCaptain"
                className="dropdown customBackground"
              >
                {selectedFromCaptainName ? selectedFromCaptainName : "Select From Captain Address"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown selectDropdown">
                {Captains.length > 0 ?
                (Captains
                .filter(captain => captain.id !== selectedToCaptain)
                .map((captain, index) => (
                  <Dropdown.Item
                    name="fromCaptain"
                    key={index}
                    onClick={() => handleFromCaptainSelect(captain.id, captain.name)}
                  >
                    {`${captain.name} (${rankMap.get(captain.rank)}) - ${captain.id}`}
                  </Dropdown.Item>
                ))
                ) : (
                  <Dropdown.Item disabled>Loading Captains...</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
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
          <Dropdown>
              <Dropdown.Toggle
                // variant="secondary"
                id="toCaptain"
                className="dropdown customBackground"
              >
                {selectedToCaptainName ? selectedToCaptainName : "Select To Captain Address"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown selectDropdown">
                {Captains.length > 0 ?
                (Captains
                .filter(captain => captain.id !== selectedFromCaptain)
                .map((captain, index) => (
                  <Dropdown.Item
                    name="toCaptain"
                    key={index}
                    onClick={() => handleToCaptainSelect(captain.id, captain.name)}
                  >
                    {`${captain.name} (${rankMap.get(captain.rank)}) - ${captain.id}`}
                  </Dropdown.Item>
                ))
                ) : (
                  <Dropdown.Item disabled>Loading Captains...</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
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
          <Dropdown>
              <Dropdown.Toggle
                // variant="secondary"
                id="toBranchId"
                className="dropdown customBackground"
              >
                {selectedPrecinctAddress
                  ? selectedPrecinctAddress
                  : "Select To Branch Id"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown selectDropdown">
                {Branches.length > 0 ?
                (Branches.map((branch, index) => (
                  <Dropdown.Item
                    name="toBranchId"
                    key={index}
                    onClick={() => handleToBranchIdDropdownSelect(branch.id, branch.precinctAddress)}
                  >
                    {`${branch.precinctAddress} - ${branch.id}`}
                  </Dropdown.Item>
                ))
                ) : (
                  <Dropdown.Item disabled>Loading Captains...</Dropdown.Item>
                )}
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
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2 btn-background"
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
