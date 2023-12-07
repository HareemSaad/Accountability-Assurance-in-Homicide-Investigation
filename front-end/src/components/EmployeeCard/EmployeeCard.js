import React, { useState, useEffect } from 'react'
import './EmployeeCard.css';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
export const EmployeeCard = () => {

    // const [EmpCardResponse, EmpCardResponse] = useState([]);
    const empCardResponse = [{ id: 21, status: "Active" }, { id: 21, status: "Cold" }, { id: 21, status: "Cold" }, { id: 21, status: "Cold" }, { id: 21, status: "Active" }, { id: 21, status: "Active" }, { id: 21, status: "Active" }, { id: 21, status: "Active" }, { id: 21, status: "Active" }, { id: 21, status: "Active" },{ id: 21, status: "Active" }];
    let navigate = useNavigate();

    function print(cardId) {
        navigate(`/employee-detail/${cardId}`);
    }

    const goto = (e) => {
        const { name } = e.target;
        console.log("params ::", name)
        navigate(`/${name}`);
    }

    return (
        <>
            <div className="d-flex justify-content-between">
                <h1 className='m-4'>Active Employees</h1>
                <div className="d-flex">
                    <button className='card-add-btn' name="add-officer" onClick={(e) => goto(e)}>Add Officer</button>
                    <button className='card-add-btn' name="archive-employees" onClick={(e) => goto(e)}>Archive</button>
                </div>
            </div>


            <div className=''>
                <div className='emp-card-container'>
                    {/* {empCardResponse.length > 0 ? empCardResponse.map((employee, index) => ( */}
                    {empCardResponse.map((employee, index) => (
                        <Card style={{ width: '18rem', height: '9rem' }} className='emp-case-card'>
                            <Card.Body>
                                <Card.Title>{employee.id}</Card.Title>
                                {/* <Card.Subtitle className="mb-2 text-muted">{officerList[employee.category]}</Card.Subtitle> */}
                                <Card.Subtitle className="mb-2 text-muted">{employee.status}</Card.Subtitle>
                                <button className='emp-card-btn' onClick={() => print(employee.id, employee.status)}>View</button>
                            </Card.Body>
                        </Card>
                    ))
                        // :
                        // <h4 style={{ textAlign: 'center' }} className='mb-2 mt-4'><em>No Officer is this Case</em></h4>
                    }
                </div>
            </div>
        </>
    )
}
