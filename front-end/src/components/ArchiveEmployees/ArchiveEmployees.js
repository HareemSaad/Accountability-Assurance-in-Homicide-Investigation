import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import './ArchiveEmployees.css';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";

export const ArchiveEmployees = () => {

    const archiveEmployee = ["Select Status", "Inactive", "Retired", "Fired"];
    const [selectedValue, setSelectedValue] = useState(null);
    const [statusValue, setStatusValue] = useState(0);

    const empCardResponseRetired = [{ id: 21, status: "Retired" }, { id: 212, status: "Retired" }, { id: 211, status: "Retired" }, { id: 2121, status: "Retired" }, { id: 2441, status: "Retired" }, { id: 21, status: "Retired" }, { id: 21, status: "Retired" }, { id: 21, status: "Retired" }, { id: 24321, status: "Retired" }, { id: 23241, status: "Retired" }, { id: 21, status: "Retired" }];

    const empCardResponseFired = [{ id: 21675, status: "Fired" }, { id: 56721, status: "Fired" }, { id: 45621, status: "Fired" }, { id: 66421, status: "Fired" }, { id: 24312, status: "Fired" }, { id: 21, status: "Fired" }, { id: 21, status: "Fired" }, { id: 21, status: "Fired" }, { id: 21, status: "Fired" }, { id: 21, status: "Fired" }, { id: 21, status: "Fired" }];

    const empCardResponseInactive = [{ id: 21675, status: "Inactive" }, { id: 56721, status: "Inactive" }, { id: 45621, status: "Inactive" }, { id: 66421, status: "Inactive" }, { id: 24312, status: "Inactive" }, { id: 21, status: "Inactive" }, { id: 21, status: "Inactive" }, { id: 21, status: "Inactive" }, { id: 21, status: "Inactive" }, { id: 21, status: "Inactive" }, { id: 21, status: "Inactive" }];

    let navigate = useNavigate();


    // Function to handle dropdown item selection
    const handleDropdownSelect = (categoryValue) => {
        setSelectedValue(categoryValue);
        setStatusValue(categoryValue);
    };

    function print(cardId) {
        navigate(`/employee-detail/${cardId}`);
    }

    return (
        <>
            <div className="d-flex justify-content-between">
                <h1 className='m-4'>{selectedValue ? `${archiveEmployee[selectedValue]} Employees` : 'Inactive Employees'}</h1>
                <div className="d-flex">
                    <div className='emp-status-dropdown'>
                        <Dropdown className='emp-status'>
                            <Dropdown.Toggle variant="secondary" id="category-type" className='dropdown'> {selectedValue ? archiveEmployee[selectedValue] : 'Select Status'} </Dropdown.Toggle>

                            <Dropdown.Menu className='dropdown'>
                                {archiveEmployee.map((category, index) => (
                                    <Dropdown.Item name='category' key={index} onClick={() => handleDropdownSelect(index)}> {category} </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* According to index of status category choosen from the dropdown employees list is shown */}
            <div className='emp-card-container'>
                {(statusValue === 2 ? empCardResponseRetired : statusValue === 3 ? empCardResponseFired : empCardResponseInactive).map((employee, index) => (
                    <Card key={index} style={{ width: '18rem' }} className='emp-case-card'>
                        <Card.Body>
                            <Card.Title>{employee.id}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{employee.status}</Card.Subtitle>
                            <button className='emp-card-btn' onClick={() => print(employee.id, employee.status)}>View</button>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </>
    )
}
