import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
// import './ArchiveEmployees.css';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";

export const CreateRequest = () => {

    const requestCategory = [{ "name": "Create Branch", "end-point": "create-branch" }, { "name": "Officer Onboard", "end-point": "officer-onboard" }, { "name": "Officer Offboard", "end-point": "officer-offboard" }, { "name": "Transfer Officer Branch", "end-point": "transfer-officer-branch" }, { "name": "Update Branch", "end-point": "update-branch" }, { "name": "Update Officer", "end-point": "update-officer" }, { "name": "Transfer Captain", "end-point": "transfer-captain" }, { "name": "Transfer Case", "end-point": "transfer-case" }];

    // const requestCategory = [{ "name": "Create Branch", "end-point": "create-branch" }, { "name": "Officer Onboard", "end-point": "officer-onboard" }, { "name": "Officer Offboard", "end-point": "officer-offboard" }, { "name": "Transfer Officer Branch", "end-point": "transfer-officer-branch" }, { "name": "Trustee Request", "end-point": "trustee-request" }, { "name": "Update Branch", "end-point": "update-branch" }, { "name": "Update Officer", "end-point": "update-officer" }, { "name": "Transfer Captain", "end-point": "transfer-captain" }, { "name": "Transfer Case", "end-point": "transfer-case" }];

    let navigate = useNavigate();

    function print(cardEndpoint) {
        navigate(`/create-request/${cardEndpoint}`);
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
                            <Card.Title>{card.name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Request</Card.Subtitle>
                            <button className='emp-card-btn' onClick={() => print(card['end-point'])}>Create</button>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </>
    )
}
