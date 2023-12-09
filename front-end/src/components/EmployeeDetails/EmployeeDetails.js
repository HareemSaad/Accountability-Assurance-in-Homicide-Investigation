import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import "./EmployeeDetails.css"

export const EmployeeDetails = () => {
    const { employeeId } = useParams();
    let navigate = useNavigate();

    const employeeDetail = {
        "name": "John Doe",
        "rank": "Officer",
        "batch": "2020",
        "branch id": "544JJHH",
        "status": "Active"
        // "status": "Inactive"
        // "status": "Fired"
        // "status": "Retired"
    }

    const goto = (e) => {
        const { name } = e.target;
        console.log("params ::", name, employeeId)
        navigate(`/${name}/${employeeId}`);
    }

    return (
        <div className='container'>
            {/* case Number and change status button */}
            <div className="d-flex justify-content-between">
                <div className='m-3 mt-5 d-flex flex-row'>
                    <h2>Employee ID: {employeeId}</h2>
                    {/* case status */}
                    {/* <h6 className='statusTagOpen ms-4'>#ACTIVE</h6> */}
                    <h6 className={`statusTag${employeeDetail.status} ms-4`}>#{employeeDetail.status.toUpperCase()}</h6>
                </div>

                <button className='case-nav-btn m-4' name="change-employee-status" onClick={(e) => goto(e)}>Change Status</button>
            </div>

            <form>
            {/* Employee Name */}
            <div className="row g-3 align-items-center m-4 ms-5">
                <div className="col-2">
                    <label htmlFor="employeeName" className="col-form-label"><b><em>Employee Name</em></b></label>
                </div>
                <div className="col-9 input">
                    <input type="text" name='id' id="employeeName" className="form-control" value={employeeDetail.name} disabled />
                </div>
            </div>

            {/* Employee Rank */}
            <div className="row g-3 align-items-center m-4 ms-5">
                <div className="col-2">
                    <label htmlFor="employeeRank" className="col-form-label"><b><em>Employee Rank</em></b></label>
                </div>
                <div className="col-9 input">
                    <input type="text" name='rank' id="employeeRank" className="form-control" value={employeeDetail.rank} disabled />
                </div>
            </div>

            {/* Employee Batch */}
            <div className="row g-3 align-items-center m-4 ms-5">
                <div className="col-2">
                    <label htmlFor="employeeBatch" className="col-form-label"><b><em>Employee Batch</em></b></label>
                </div>
                <div className="col-9 input">
                    <input type="text" name='batch' id="employeeBatch" className="form-control" value={employeeDetail.batch} disabled />
                </div>
            </div>

            {/* Employee Branch Id */}
            <div className="row g-3 align-items-center m-4 ms-5">
                <div className="col-2">
                    <label htmlFor="employeeBranchId" className="col-form-label"><b><em>Employee Branch Id</em></b></label>
                </div>
                <div className="col-9 input">
                    <input type="text" name='branchId' id="employeeBranchId" className="form-control" value={employeeDetail['branch id']} disabled />
                </div>
            </div>
            </form>

        </div>

    );
};
