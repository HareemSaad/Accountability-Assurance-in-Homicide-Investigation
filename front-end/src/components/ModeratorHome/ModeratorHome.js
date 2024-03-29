import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
// import './ArchiveEmployees.css';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";

export const ModeratorHome = () => {

    const requestCategory = [{ "name": "Create Branch", "end-point": "create-branch" }, { "name": "Officer Onboard", "end-point": "officer-onboard" }, { "name": "Officer Offboard", "end-point": "officer-offboard" }, { "name": "Transfer Officer Branch", "end-point": "transfer-officer-branch" }, { "name": "Trustee Request", "end-point": "trustee-request" }, { "name": "Transfer Captain", "end-point": "transfer-captain" }, { "name": "Transfer Case", "end-point": "transfer-case" }];
    // const requestCategory = [{ "name": "Create Branch", "end-point": "create-branch" }, { "name": "Officer Onboard", "end-point": "officer-onboard" }, { "name": "Officer Offboard", "end-point": "officer-offboard" }, { "name": "Transfer Officer Branch", "end-point": "transfer-officer-branch" }, { "name": "Trustee Request", "end-point": "trustee-request" }, { "name": "Update Branch", "end-point": "update-branch" }, { "name": "Update Officer", "end-point": "update-officer" }, { "name": "Transfer Captain", "end-point": "transfer-captain" }, { "name": "Transfer Case", "end-point": "transfer-case" }];

    let navigate = useNavigate();

    function print(cardName) {
        // navigate(`/${cardEndpoint}`);
        if (cardName === "Create Branch"){
            navigate(`/view-create-branch`);
        } else if(cardName === "Officer Onboard") {
            navigate(`/view-officer-onboard`);
        } else if(cardName === "Officer Offboard") {
            navigate(`/view-officer-offboard`);
        } else if(cardName === "Transfer Officer Branch") {
            navigate(`/view-transfer-officer-branch`);
        } else if(cardName === "Trustee Request") {
            navigate(`/view-trustee-request`);
        // } else if(cardName === "Update Branch") {
            // navigate(`/view-update-branch`);
        // } else if(cardName === "Update Officer") {
            // navigate(`/view-update-officer`);
        } else if(cardName === "Transfer Captain") {
            navigate(`/view-transfer-captain`);
        } else if(cardName === "Transfer Case") {
            navigate(`/view-transfer-case`);
        } 
    }

    const goto = (e) => {
        const { name } = e.target;
        console.log("params ::", name)
        navigate(`/${name}`);
    }

    return (
        <>

            <div className="d-flex justify-content-between">
                <h1 className='m-4'>Requests</h1>
                <div className="d-flex">
                    <button className='card-add-btn' name="create-request" onClick={(e) => goto(e)}>Create Requests</button>
                    {/* <button className='card-add-btn' name="my-requests" onClick={(e) => goto(e)}>My Requests</button> */}
                </div>
            </div>

            {/* According to index of status category choosen from the dropdown employees list is shown */}
            <div className='emp-card-container'>
                {requestCategory.map((card, index) => (
                    <Card key={index} style={{ width: '18rem' }} className='emp-case-card'>
                        <Card.Body>
                            <Card.Title>{card.name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Request</Card.Subtitle>
                            {/* <button className='emp-card-btn' onClick={() => print(card['end-point'])}>View Requests</button> */}
                            <button className='emp-card-btn' onClick={() => print(card.name)}>View Requests</button>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </>
    )
}
