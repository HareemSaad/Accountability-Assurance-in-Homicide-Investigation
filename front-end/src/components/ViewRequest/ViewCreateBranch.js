import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useUserAddressContext } from "../Context/userAddressContext.tsx";
import moment from "moment";

export const ViewCreateBranch = () => {
  const { reqId } = useParams();
  const { userAddress, setUserAddress } = useUserAddressContext();

  const [isButtonDisabled, setButtonDisabled] = useState(false);

  let navigate = useNavigate();

  const [requestDetail, setRequestDetail] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:3000/view-create-branch/:${reqId}`)
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
      .post(`http://localhost:3000/view-create-branch/:${reqId}`, {
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
      <h2 className="m-3 mt-5 mb-4">Create Branch Request #{reqId}</h2>
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
              className="form-control"
              value={requestDetail.precinctAddress}
              disabled
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
              className="form-control"
              value={requestDetail.jurisdictionArea}
              disabled
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
              className="form-control"
              value={requestDetail.stateCode}
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
