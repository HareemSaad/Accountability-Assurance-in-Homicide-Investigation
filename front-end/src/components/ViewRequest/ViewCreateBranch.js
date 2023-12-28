import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";

export const ViewCreateBranch = () => {
    const { reqId } = useParams();

    let navigate = useNavigate();

    const requestDetail = {
        precinctAddress: 'ABC Road',
        jurisdictionArea: 'XYZ',
        stateCode: '234',
        branchId: 'DKFJ2311',
    }

    return (
        <div className='container'>
            <h2 className='m-3 mt-5 mb-4'>Create Branch Request# {reqId}</h2>
            <form>
                {/* Precinct Address */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="precinctAddress" className="col-form-label"><b><em>Precinct Address:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='precinctAddress' id="precinctAddress" className="form-control" value={requestDetail.precinctAddress} disabled></input>
                    </div>
                </div>

                {/* Jurisdiction Area */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="jurisdictionArea" className="col-form-label"><b><em>Jurisdiction Area:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='jurisdictionArea' id="jurisdictionArea" className="form-control" value={requestDetail.jurisdictionArea} disabled></input>
                    </div>
                </div>

                {/* State Code */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="stateCode" className="col-form-label"><b><em>State Code:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='stateCode' id="stateCode" className="form-control" value={requestDetail.stateCode} disabled></input>
                    </div>
                </div>

                {/* Branch Id */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="branchId" className="col-form-label" ><b><em>Branch Id:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='branchId' id="branchId" className="form-control" value={requestDetail.branchId} disabled></input>
                    </div>
                </div>

            </form>
        </div>
    );

}
