import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import './ArchiveCases.css';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
import { useAccount } from 'wagmi'
import { client } from '../data/data';

export const ArchiveCases = () => {

    const archiveCases = ["Select Status", "Closed", "Cold"];
    const [selectedValue, setSelectedValue] = useState(null);
    const [cases, setCases] = useState([]);
    const [statusValue, setStatusValue] = useState(0);
    const { address } = useAccount()
    let navigate = useNavigate();  
    
    useEffect(() => {
        fetchData();
    }, [statusValue]);

    async function fetchData() {
        const query = `
        {
            officer(id: "${address}") {
                cases (where: {status: ${statusValue + 1}}) {
                id
                }
            }
        }
        `;
        const response = await client.query(query).toPromise();
        const { data } = response;
        console.log(data.officer.cases);
        setCases(data.officer.cases);
    }

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

            {/* According to index of status category choosen from the dropdown cases list is shown */}
            <div className='emp-card-container'>
                {cases.map((caseCard, index) => (
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
