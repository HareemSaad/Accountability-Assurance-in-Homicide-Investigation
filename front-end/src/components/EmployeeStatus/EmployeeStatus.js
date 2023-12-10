import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { notify } from "./../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";

export const EmployeeStatus = () => {
    const { employeeId } = useParams();
    let navigate = useNavigate();

    const [employeeStatus, setEmployeeStatus] = useState("");

    // Function to handle dropdown item selection
    const [selectedValue, setSelectedValue] = useState(null);
    const statusArray = ['Select a Status', 'Active', 'Inactive', 'Fired', 'Retired'];

    const handleDropdownSelect = (statusValue) => {
        setSelectedValue(statusValue);
        setEmployeeStatus(statusValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (employeeStatus === '') {
            notify("error", `Select From Dropdown`);
        } else {
            console.log("employeeStatus ::", employeeStatus)
        }
    }

    return (
        <div className='container'>
            {/* Heading */}
            <h2 className='m-3 mt-5 mb-4'>Change Employee Status</h2>
            <form>
                {/* Case Number */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="caseNumber" className="col-form-label"><b><em>Employee Number</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='id' id="employeeNumber" placeholder='Enter Employee Number Here' className="form-control" value={employeeId} disabled />
                    </div>
                </div>

                {/* Change Case Status */}
                <div className="row g-3 align-items-center m-3">

                    <div className="col-2">
                        <label htmlFor="category-type" className="col-form-label"><b><em>Select Status</em></b></label>
                    </div>

                    <div className="col-9">
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="category-type" className='dropdown'> {selectedValue ? statusArray[selectedValue] : 'Select Status'} </Dropdown.Toggle>

                            <Dropdown.Menu className='dropdown'>
                                {statusArray.map((status, index) => (
                                    <Dropdown.Item name='category' key={index} onClick={() => handleDropdownSelect(index)}> {status} </Dropdown.Item>
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
