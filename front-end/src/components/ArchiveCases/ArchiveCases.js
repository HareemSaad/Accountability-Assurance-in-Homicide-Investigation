import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import './ArchiveCases.css';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";

export const ArchiveCases = () => {

    const archiveCases = ["Select Status", "Closed", "Cold"];
    const [selectedValue, setSelectedValue] = useState(null);
    const [statusValue, setStatusValue] = useState(0);

    const casesCardResponseCold = [{ id: 21, status: "Cold" }, { id: 212, status: "Cold" }, { id: 211, status: "Cold" }, { id: 2121, status: "Cold" }, { id: 2441, status: "Cold" }, { id: 21, status: "Cold" }, { id: 21, status: "Cold" }, { id: 21, status: "Cold" }, { id: 24321, status: "Cold" }, { id: 23241, status: "Cold" }, { id: 21, status: "Cold" }];

    const casesCardResponseClosed = [{ id: 21675, status: "Closed" }, { id: 56721, status: "Closed" }, { id: 45621, status: "Closed" }, { id: 66421, status: "Closed" }, { id: 24312, status: "Closed" }, { id: 21, status: "Closed" }, { id: 21, status: "Closed" }, { id: 21, status: "Closed" }, { id: 21, status: "Closed" }, { id: 21, status: "Closed" }, { id: 21, status: "Closed" }];
    let navigate = useNavigate();


    // Function to handle dropdown item selection
    const handleDropdownSelect = (categoryValue) => {
        setSelectedValue(categoryValue);
        setStatusValue(categoryValue);
    };

    function print(cardId) {
        navigate(`/case-detail/${cardId}`);
    }

    return (
        <>
            <div className="d-flex justify-content-between">
                <h1 className='m-4'>{selectedValue ? `${archiveCases[selectedValue]} Cases` : 'Closed Cases'}</h1>
                <div className="d-flex">
                    <div className='emp-status-dropdown'>
                        <Dropdown className='emp-status'>
                            <Dropdown.Toggle variant="secondary" id="category-type" className='dropdown'> {selectedValue ? archiveCases[selectedValue] : 'Select Status'} </Dropdown.Toggle>

                            <Dropdown.Menu className='dropdown'>
                                {archiveCases.map((category, index) => (
                                    <Dropdown.Item name='category' key={index} onClick={() => handleDropdownSelect(index)}> {category} </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* According to index of status category choosen from the dropdown employees list is shown */}
            <div className='emp-card-container'>
                {(statusValue === 2 ? casesCardResponseCold : casesCardResponseClosed).map((caseCard, index) => (
                    <Card key={index} style={{ width: '18rem' }} className='emp-case-card'>
                        <Card.Body>
                            <Card.Title>Case# {caseCard.id}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{caseCard.status}</Card.Subtitle>
                            <button className='emp-card-btn' onClick={() => print(caseCard.id, caseCard.status)}>View</button>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </>
    )
}
