import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";

export const TrusteeRequest = () => {

    let navigate = useNavigate();

    const [trusteeRequestInfo, setTrusteeRequestInfo] = useState({
        caseId: '',
        trusteeAddress: '',
        captainAddress: '',
        branchId: '',
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setTrusteeRequestInfo({ ...trusteeRequestInfo, [name]: value });
        console.log("params :: ", name)
        console.log("value :: ", value)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (trusteeRequestInfo.caseId === '') {
            notify("error", `Case Id is empty`);
        } else if (trusteeRequestInfo.trusteeAddress === '') {
            notify("error", `Trustee Address is empty`);
        } else if (trusteeRequestInfo.captainAddress === '') {
            notify("error", `Captain Address is empty`);
        } else if (trusteeRequestInfo.branchId === '') {
            notify("error", `Branch Id is empty`);
        }
    }


    return (
        <div className='container'>
            <h2 className='m-3 mt-5 mb-4'>Trustee Request</h2>
            <form>
                {/* Case Id */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="caseId" className="col-form-label"><b><em>Case Id:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='caseId' id="caseId" placeholder='Enter Case Id Here' className="form-control" onChange={handleChange}></input>
                    </div>
                </div>

                {/* Trustee */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="trusteeAddress" className="col-form-label"><b><em>Trustee Address:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='trusteeAddress' id="trusteeAddress" placeholder='Enter Trustee Here' className="form-control" onChange={handleChange}></input>
                    </div>
                </div>

                {/* captain address*/}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="captainAddress" className="col-form-label"><b><em>Captain Address:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='captainAddress' id="captainAddress" placeholder='Enter captain Here' className="form-control" onChange={handleChange}></input>
                    </div>
                </div>

                {/* Branch Id */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="branchId" className="col-form-label"><b><em>Branch Id:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='branchId' id="branchId" placeholder='Enter Branch Id Here' className="form-control" onChange={handleChange}></input>
                    </div>
                </div>

                {/* submit button */}
                <button className='btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2' type="submit" onClick={async (e) => await handleSubmit(e)}>
                    Create Trustee Request
                </button>

            </form>
        </div>
    );

}
