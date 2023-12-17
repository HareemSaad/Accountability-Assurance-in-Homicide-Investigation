import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
// import './ArchiveEmployees.css';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";

export const CreateRequest = () => {

    const archiveEmployee = ["Select Status", "Inactive", "Retired", "Fired"];
    const [selectedValue, setSelectedValue] = useState(null);
    const [statusValue, setStatusValue] = useState(0);

    const requestCategory = ["Create Branch", "Officer Onboard", "Trustee Request", "Update Branch", "Update Officer"];

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
                <h1 className='m-4'>Create Request For</h1>
            </div>

            {/* According to index of status category choosen from the dropdown employees list is shown */}
            <div className='emp-card-container'>
                {requestCategory.map((card, index) => (
                    <Card key={index} style={{ width: '18rem' }} className='emp-case-card'>
                        <Card.Body>
                            <Card.Title>{card}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Request</Card.Subtitle>
                            <button className='emp-card-btn' onClick={() => print(card)}>Create</button>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </>
    )
}
