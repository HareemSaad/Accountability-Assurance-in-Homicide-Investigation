import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useUserAddressContext } from "../Context/userAddressContext.tsx";
import { employmentStatusMap, rankMap } from "../data/data.js";
import moment from "moment";

export const ViewOfficerOffboard = () => {
  const { reqId } = useParams();
  const { userAddress, setUserAddress } = useUserAddressContext();
  let navigate = useNavigate();

  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [requestDetail, setRequestDetail] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:3000/view-officer-offboard/:${reqId}`)
      .then((result) => setRequestDetail(result.data[0]))
      .catch((err) => console.log("error:: ", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);
    // axiospost - update the array of signers/signatures...
    axios
      .post(`http://localhost:3000/view-officer-offboard/:${reqId}`, {
        userAddress: userAddress,
      })
      .then((res) => notify("success", "Signed successfully"))
      .catch((err) => {
        // console.log("error:: ", err);
        notify("error", `An Error Occured when Signing`);
      });
  };

  const getDate = (expiryDate) => {
    var date = new Date(expiryDate * 1000);
    return moment(date).format("MMMM Do YYYY");
  };

  return (
    <div className="container">
      
      <div className="m-3 mt-5 mb-4 d-flex flex-row">
        {/* <h2 className="m-3 mt-5 mb-4">Officer Offboard Request #{reqId}</h2> */}
        <h2>Officer Offboard Request #{reqId}</h2>
        <h6 className={`statusTag${ requestDetail.isOpen === true ? "Open" : "Close" } ms-3`}>
          #{requestDetail.isOpen === true ? "OPEN" : "CLOSED"}
        </h6>
      </div>

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
              className="form-control"
              value={requestDetail.verifiedAddress}
              disabled
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
              className="form-control"
              value={requestDetail.name}
              disabled
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
              className="form-control"
              value={requestDetail.legalNumber}
              disabled
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
              className="form-control"
              value={requestDetail.badge}
              disabled
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
              type="text"
              name="branchId"
              id="branchId"
              className="form-control"
              value={requestDetail.branchId}
              disabled
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
          <div className="col-9 input">
            <input
              type="text"
              name="rank"
              id="rank"
              className="form-control"
              value={rankMap.get(requestDetail.rank)}
              disabled
            ></input>
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
              value={employmentStatusMap.get(requestDetail.employmentStatus)}
              disabled
            />
          </div>
        </div>

        {/* Expiry */}
        <div className="row g-3 align-items-center m-3 mb-5">
          <div className="col-2">
            <label htmlFor="expiry" className="col-form-label">
              <b>
                <em>Expiry Date:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="expiry"
              id="expiry"
              className="form-control"
              value={getDate(requestDetail.expiry)}
              disabled
            ></input>
          </div>
        </div>

        {/* sign button */}
        <button
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
          type="submit"
          onClick={async (e) => await handleSubmit(e)}
          disabled={isButtonDisabled}
        >
          Sign
        </button>
      </form>
    </div>
  );
};
