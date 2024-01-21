import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { notify } from "./../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import { employmentStatusMap } from "../data/data.js";

export const EmployeeStatus = () => {
    const { employeeId } = useParams();
    let navigate = useNavigate();

    const [employeeStatus, setEmployeeStatus] = useState("");

    // Function to handle dropdown item selection
    const [selectedStatusValue, setSelectedStatusValue] = useState(null);

    // useEffect(() => {
    //   console.log("employeeStatus: ", employeeStatus)
    //   console.log("selectedStatusValue: ", selectedStatusValue)
    // }, [employeeStatus])
    

    const handleDropdownSelect = (statusValue) => {
        setSelectedStatusValue(statusValue);
        setEmployeeStatus(statusValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (employeeStatus === '') {
            notify("error", `Select From Dropdown`);
        } else {
            console.log("employeeStatus ::", employeeStatus)
        }

        // HAREEM TODO - contract call -- save new employment status
    }

    return (
        <div className='container'>
            {/* Heading */}
            <h2 className='m-3 mt-5 mb-4'>Change Employee Status</h2>
            <form>
                {/* Case Number */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="employeeId" className="col-form-label"><b><em>Employee Number</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='id' id="employeeId" className="form-control" value={employeeId} disabled />
                    </div>
                </div>

                {/* Change employment Status */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="category-type" className="col-form-label"><b><em>Select Status</em></b></label>
                    </div>
                    <div className="col-9">
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="category-type" className='dropdown'> {selectedStatusValue ? employmentStatusMap.get(selectedStatusValue) : "Select Employment Status"} </Dropdown.Toggle>

                            <Dropdown.Menu className='dropdown'>
                                {Array.from(employmentStatusMap).map(([key, value]) => (
                                    <Dropdown.Item name='category' key={key} onClick={() => handleDropdownSelect(key)}> {value} </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                <button className='btn btn-primary d-grid gap-2 col-6 mx-auto m-5 p-2' type="submit" onClick={async (e) => await handleSubmit(e)}>
                    Save Employee Status
                </button>

            </form>
        </div>
    );

}
