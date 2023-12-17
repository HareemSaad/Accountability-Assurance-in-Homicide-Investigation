import React, { useState, useEffect } from 'react'
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
// import { useUserContext } from '../Context/userContext.tsx';


export const ModeratorHome = () => {
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
                <h1 className='m-4'>Requests</h1>
                <div className="d-flex">
                    <button className='card-add-btn' name="create-request" onClick={(e) => goto(e)}>Create Requests</button>
                    {/* <button className='card-add-btn' name="add-officer" onClick={(e) => goto(e)}>Add Officer</button> */}
                    <button className='card-add-btn' name="my-requests" onClick={(e) => goto(e)}>My Requests</button>
                    {/* <button className='card-add-btn' name="archive-requests" onClick={(e) => goto(e)}>Archive Cases</button> */}
                </div>
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
