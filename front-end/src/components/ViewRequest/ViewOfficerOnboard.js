import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

export const ViewOfficerOnboard = () => {
    const { reqId } = useParams();
    let navigate = useNavigate();

    const requestDetail = {
        verifiedAddress: 'X12345345TIOWEHAESDG',
        name: 'Jane Doe',
        legalNumber: '235231',
        badge: '3452',
        branchId: '444',
        rank: 'Detective',
        employmentStatus: 'Retired'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    }

    return (
        <div className='container'>
            <h2 className='m-3 mt-5 mb-4'>Officer Onboard Request #{reqId}</h2>
            <form>
                {/* Verified Address */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="verifiedAddress" className="col-form-label"><b><em>Verified Address:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='verifiedAddress' id="verifiedAddress" className="form-control" value={requestDetail.verifiedAddress} disabled></input>
                    </div>
                </div>

                {/* Name */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="name" className="col-form-label"><b><em>Name:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='name' id="name" className="form-control" value={requestDetail.name} disabled></input>
                    </div>
                </div>

                {/* legal Number */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="legalNumber" className="col-form-label"><b><em>Legal Number:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='legalNumber' id="legalNumber" className="form-control" value={requestDetail.legalNumber} disabled></input>
                    </div>
                </div>

                {/* badge */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="badge" className="col-form-label"><b><em>Badge:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='badge' id="badge" className="form-control" value={requestDetail.badge} disabled></input>
                    </div>
                </div>

                {/* Branch Id */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="branchId" className="col-form-label"><b><em>Branch Id:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='branchId' id="branchId" className="form-control" value={requestDetail.branchId} disabled></input>
                    </div>
                </div>

                {/* Officer Rank dropdown */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="officerRank" className="col-form-label"><b><em>Officer Rank:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='rank' id="rank" className="form-control" value={requestDetail.rank} disabled></input>
                    </div>
                </div>

                {/* Employment Status */}
                <div className="row g-3 align-items-center m-3 mb-5">
                    <div className="col-2">
                        <label htmlFor="employmentStatus" className="col-form-label"><b><em>Employment Status:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='employmentStatus' id="employmentStatus" className="form-control" value={requestDetail.employmentStatus} disabled />
                    </div>
                </div>

                {/* sign button */}
                <button className='btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2' type="submit" onClick={async (e) => await handleSubmit(e)}>
                    Sign 
                </button>

            </form>
        </div>
    );

}
