import React, { useState, useEffect } from 'react'
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
// import { useUserContext } from '../Context/userContext.tsx';


export const ViewRequests = () => {
    const { reqName } = useParams();
    // const { user, setUser } = useUserContext();

    const [allRequests, setAllRequests] = useState([]);
    let navigate = useNavigate();

    useEffect(() => {
        const allRequests = [{ id: 13, status: "Open" }, { id: 27, status: "Open" }, { id: 36, status: "Open" }, { id: 45, status: "Open" }];
        setAllRequests(allRequests);
    }, []);

    function print(cardId) {
        navigate(`/case-detail/${cardId}`);
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
                        <h2 className='mb-3 mt-3 pb-5'>Request# {card.id}</h2>
                        <button className='card-btn' onClick={() => print(card.id, card.status)}>View</button>
                    </Card>
                ))}
            </div>


        </>
    )
}