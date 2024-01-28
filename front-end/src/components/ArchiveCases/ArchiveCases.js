import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import './ArchiveCases.css';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
import { useAccount } from 'wagmi';
import { client } from '../data/data';
import { caseStatusMap } from '../data/data';

export const ArchiveCases = () => {

    const statusArray = Array.from(caseStatusMap).slice(-2); // dropdown array
    const [selectedStatusValue, setSelectedStatusValue] = useState(null);

    const [cases, setCases] = useState([]);
    const [statusValue, setStatusValue] = useState(2);
    const { address } = useAccount()
    let navigate = useNavigate();  
    
    useEffect(() => {
        // console.log("selectedStatusValue: ", selectedStatusValue)
        // console.log("statusValue: ", statusValue)
        fetchData();
    }, [statusValue]);

    async function fetchData() {
        const query = `
        {
            officer(id: "${address}") {
                cases (where: {status: ${statusValue}}) {
                id
                }
            }
        }
        `;
        const response = await client.query(query).toPromise();
        const { data } = response;
        // console.log(data.officer.cases);
        setCases(data.officer.cases);
    }

    // Function to handle dropdown item selection
    const handleDropdownSelect = (categoryValue) => {
        setSelectedStatusValue(categoryValue);
        setStatusValue(categoryValue);
    };

    function print(cardId) {
        navigate(`/case-detail/${cardId}`);
    }

    return (
        <>
            <div className="d-flex justify-content-between">
                {/* Heading */}
                {/* <h1 className='m-4'>{selectedStatusValue ? `${archiveCases[selectedStatusValue]} Cases` : 'Closed Cases'}</h1> */}
                <h1 className='m-4'>{selectedStatusValue ? `${caseStatusMap.get(selectedStatusValue)} Cases` : 'Closed Cases'}</h1>
                <div className="d-flex">
                    {/* status dropdown */}
                    <div className='emp-status-dropdown'>
                        <Dropdown className='emp-status'>
                            <Dropdown.Toggle id="category-type" className='dropdown customBackground'> {selectedStatusValue ? caseStatusMap.get(selectedStatusValue) : "Select Case Status"} </Dropdown.Toggle>

                            <Dropdown.Menu className='dropdown selectDropdown'>
                                {statusArray.map(([key, value]) => (
                                    <Dropdown.Item name='category' className='dropdown-item' key={key} onClick={() => handleDropdownSelect(key)}> {value} </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* According to index of status category choosen from the dropdown cases list is shown */}
            <div className='emp-card-container'>
                {cases.length > 0 ? (cases.map((caseCard, index) => (
                    <Card key={index} style={{ width: '18rem' }} className='emp-case-card'>
                        <Card.Body>
                            <Card.Title>Case# {caseCard.id}</Card.Title>
                            {/* <Card.Subtitle className="mb-2 text-muted">{caseCard.status}</Card.Subtitle> */}
                            <Card.Subtitle className="mb-2 text-muted">{selectedStatusValue ? `${caseStatusMap.get(selectedStatusValue)}` : 'Closed'}</Card.Subtitle>
                            <button className='emp-card-btn' onClick={() => print(caseCard.id)}>View</button>
                        </Card.Body>
                    </Card>
                ))
            ): (
                <div className='noData'>
                    <h4 style={{ textAlign: 'center' }} className='mb-2 mt-4'><em>No Cases to Show</em></h4>
                </div>
            )}
            </div>
        </>
    )
}
