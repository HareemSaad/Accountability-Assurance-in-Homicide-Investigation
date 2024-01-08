import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import "./view.css";
import axios from "axios";

export const ViewTrusteeRequest = () => {
  const { reqId } = useParams();

  let navigate = useNavigate();
  let n;

  const [requestDetail, setRequestDetail] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:3000/view-trustee-request/:${reqId}`)
      .then((result) => setRequestDetail(result.data[0]))
      .catch((err) => console.log("error:: ", err));
  }, []);

  // const requestDetail = {
  //     caseId: '235',
  //     trusteeAddress: '0234rtjb',
  //     captainAddress: '0ZXGETR4557852',
  //     branchId: '3',
  //     signer: ['0X24335faerw', '0Xkdfa3245325', '0Xklouwrn34iy08', '0Xkdfa3245325', '0X24335faerw', '0X24335faerw', '0Xkdfa3245325', '0Xklouwrn34iy08', '0Xkdfa3245325', '0X24335faerw', '0Xklouwrn34iy08', '0Xkdfa3245325', '0X24335faerw', '0Xkdfa3245325', '0Xklouwrn34iy08', '0Xkdfa3245325', '0X24335faerw', '0X24335faerw', '0Xkdfa3245325', '0Xklouwrn34iy08', '0Xkdfa3245325', '0X24335faerw', '0Xklouwrn34iy08', '0Xklouwrn34iy080Xkdfa32453250Xklouwrn34iy08']
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
  };


  return (
    <div className="container">
      <h2 className="m-3 mt-5 mb-4">Trustee Request #{reqId}</h2>
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
            <input
              type="number"
              name="caseId"
              id="caseId"
              className="form-control"
              value={requestDetail.caseId}
              disabled
            ></input>
          </div>
        </div>

        {/* Trustee */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="trustee" className="col-form-label">
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
              className="form-control"
              value={requestDetail.trustee}
              disabled
            ></input>
          </div>
        </div>

        {/* captain address*/}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="captain" className="col-form-label">
              <b>
                <em>Captain Address:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input">
            <input
              type="text"
              name="captain"
              id="captain"
              className="form-control"
              value={requestDetail.captain}
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
              type="number"
              name="branchId"
              id="branchId"
              className="form-control"
              value={requestDetail.branchId}
              disabled
            ></input>
          </div>
        </div>

        {/* Signers */}
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor="branchId" className="col-form-label">
              <b>
                <em>Signers:</em>
              </b>
            </label>
          </div>
          <div className="col-9 input d-flex flex-wrap">
            {(requestDetail.signers ?? []).length === 0 ? (
              <input
                type="text"
                className="form-control mb-2"
                value="No one has signed yet."
                disabled
              />
            ) : (
              requestDetail.signers.map((signer, index) => (
                <input
                  type="text"
                  name={`signer-${index}`}
                  id={`signer-${index}`}
                  className="form-control signer mb-2"
                  value={signer}
                  disabled
                />
              ))
            )}
          </div>
        </div>

        {/* sign button */}
        <button
          className="btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2"
          type="submit"
          onClick={async (e) => await handleSubmit(e)}
        >
          Sign
        </button>
      </form>
    </div>
  );
};
