import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import './ArchiveEmployees.css';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
import { employmentStatusMap, rankMap } from "../data/data.js";
import { client } from '../data/data';
import { useAccount } from 'wagmi';

export const ArchiveEmployees = () => {
    const { address, connector, isConnected, account } = useAccount();  

    const [selectedValue, setSelectedValue] = useState(null);
    const [statusValue, setStatusValue] = useState(0);
    const [empCardResponse, setEmpCardResponse] = useState([]);
    let navigate = useNavigate();

    // Values you want to include in the new array
    const valuesToInclude = ["0", "2", "3"];
    // Create a new array with values from the employmentStatusMap
    const archiveEmployee = Array.from(employmentStatusMap)
    .filter(([key]) => valuesToInclude.includes(key))
    .map(([key, value]) => ({ key, value }));
    
    useEffect(() => {
        // console.log("selectedValue:: ", selectedValue)
        // console.log("statusValue:: ", statusValue)
        fetchData();
    }, [statusValue])
    

    async function fetchData() {
        const query = `
        {
            officers(where: {branch: "${localStorage.getItem("branchid")}", employmentStatus: ${statusValue}}) {
              name
              id
              rank
            }
          }
        `;
        const response = await client.query(query).toPromise();
        const { data, fetching, error } = response;
        console.log(data.officers);
        setEmpCardResponse(data.officers);
    }

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
                <h1 className='m-4'>{selectedValue ? `${employmentStatusMap.get(`${selectedValue}`)} Employees` : 'Inactive Employees'}</h1>

                <div className="d-flex">
                    <div className='emp-status-dropdown'>

                        <Dropdown className='emp-status'>
                            <Dropdown.Toggle id="category-type" className='dropdown customBackground'> {selectedValue ? employmentStatusMap.get(`${selectedValue}`) : 'Select Status'} </Dropdown.Toggle>

                            <Dropdown.Menu className='dropdown selectDropdown'>
                                {archiveEmployee.map(({key, value}) => (
                                    <Dropdown.Item name='category' className='dropdown-item' key={key} onClick={() => handleDropdownSelect(key)}> {value} </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                    </div>
                </div>
            </div>

            {/* According to index of status category choosen from the dropdown employees list is shown */}
            <div className='emp-card-container'>
                {empCardResponse.length > 0 ? (empCardResponse.map((employee, index) => (
                    <Card key={index} style={{ width: '18rem' }} className='emp-case-card'>
                        <Card.Body>
                            <Card.Title>{employee.name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{rankMap.get(employee.rank)}</Card.Subtitle>
                            <button className='emp-card-btn' onClick={() => print(employee.id)}>View</button>
                        </Card.Body>
                    </Card>
                ))
                ): (
                    <div className='noData'>
                        <h4 style={{ textAlign: 'center' }}><em>No Employees to Show</em></h4>
                    </div>
                )}
            </div>
        </>
    )
}
