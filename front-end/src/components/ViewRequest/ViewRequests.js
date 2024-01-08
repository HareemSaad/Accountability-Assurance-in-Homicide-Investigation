import React, { useState, useEffect } from 'react'
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
// import { useUserContext } from '../Context/userContext.tsx';
import axios from 'axios';


export const ViewRequests = () => {
    const { reqName } = useParams();
    // const { user, setUser } = useUserContext();

    const [allRequests, setAllRequests] = useState([]);
    let navigate = useNavigate();

    useEffect(() => {
        // const allRequests = [{ id: 13, status: "Open" }, { id: 27, status: "Open" }, { id: 36, status: "Open" }, { id: 45, status: "Open" }];
        setAllRequests(allRequests);
        // axios.get(`http://localhost:3000/view-create-branch`)
        axios.get(`http://localhost:3000/${reqName}`)
        .then(result => setAllRequests(result.data))
        .catch(err => console.log("error:: ", err))
    }, []);

    function print(cardId) {
        // navigate(`/case-detail/${cardId}`);
        if (reqName === "view-create-branch") {
            navigate(`/view-create-branch/${cardId}`);
        } 
        else if (reqName === "view-officer-onboard") {
            navigate(`/view-officer-onboard/${cardId}`);
        } 
        else if (reqName === "view-trustee-request") {
            navigate(`/view-trustee-request/${cardId}`);
        } 
        else if (reqName === "view-update-branch") {
            navigate(`/view-update-branch/${cardId}`);
        } 
        else if (reqName === "view-update-officer") {
            navigate(`/view-update-officer/${cardId}`);
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
                {reqName === "view-create-branch" ? <h1 className='m-4'>Create Branch Requests</h1>
                    : reqName === "view-officer-onboard" ? <h1 className='m-4'>Officer Onboard Requests</h1>
                        : reqName === "view-trustee-request" ? <h1 className='m-4'>Trustee Requests</h1>
                            : reqName === "view-update-branch" ? <h1 className='m-4'>Update Branch Requests</h1>
                                : reqName === "view-update-officer" ? <h1 className='m-4'>Update Officer Requests</h1>
                                    : <h1 className='m-4'>Requests</h1>}
            </div>

            <div className='card-container'>
                {allRequests.map((card, index) => (
                    <Card className='case-card'>
                        <h2 className='mb-3 mt-3 pb-5'>Request #{card.id}</h2>
                        <button className='card-btn' onClick={() => print(card.id, card.status)}>View</button>
                    </Card>
                ))}
            </div>


        </>
    )
}