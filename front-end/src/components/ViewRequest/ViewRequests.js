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
    // const stateCode = localStorage.getItem("statecode");

    useEffect(() => {
        axios.get(`http://localhost:3000/${reqName}`, { params: {"userStateCode": localStorage.getItem("statecode")}})
        .then(result => {setAllRequests(result.data); console.log("result.data:: ", result.data)})
        .catch(err => console.log("error:: ", err))

        // console.log("stateCode: ", stateCode) 
    }, []);

    function print(cardId) {
        // navigate(`/case-detail/${cardId}`);
        if (reqName === "view-create-branch") {
            navigate(`/view-create-branch/${cardId}`);
        } 
        else if (reqName === "view-officer-onboard") {
            navigate(`/view-officer-onboard/${cardId}`);
        }
        else if (reqName === "view-officer-offboard") {
            navigate(`/view-officer-offboard/${cardId}`);
        } 
        else if (reqName === "view-transfer-officer-branch") {
            navigate(`/view-transfer-officer-branch/${cardId}`);
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
        else if (reqName === "view-transfer-captain") {
            navigate(`/view-transfer-captain/${cardId}`);
        } 
        else if (reqName === "view-transfer-case") {
            navigate(`/view-transfer-case/${cardId}`);
        }
        // from employee card for captain - not for moderators
        else if (reqName === "view-officer-requests") {
            navigate(`/view-officer-requests/${cardId}`);
        }
        else if (reqName === "view-detective-requests") {
            navigate(`/view-detective-requests/${cardId}`);
        }
    }

    const goto = (e) => {
        const { name } = e.target;
        console.log("params ::", name)
        navigate(`/${name}`);
    }

    return (
        <>
            {/* heading */}
            <div className="d-flex justify-content-between">
                {reqName === "view-create-branch" ? <h1 className='m-4'>Create Branch Requests</h1>
                    : reqName === "view-officer-onboard" ? <h1 className='m-4'>Officer Onboard Requests</h1>
                    : reqName === "view-officer-offboard" ? <h1 className='m-4'>Officer Offboard Requests</h1>
                    : reqName === "view-transfer-officer-branch" ? <h1 className='m-4'>Transfer Officer Branch Requests</h1>
                    : reqName === "view-trustee-request" ? <h1 className='m-4'>Trustee Requests</h1>
                    : reqName === "view-update-branch" ? <h1 className='m-4'>Update Branch Requests</h1>
                    : reqName === "view-update-officer" ? <h1 className='m-4'>Update Officer Requests</h1>
                    : reqName === "view-transfer-captain" ? <h1 className='m-4'>Transfer Captain Requests</h1>
                    : reqName === "view-transfer-case" ? <h1 className='m-4'>Transfer Case Requests</h1>
                    : reqName === "view-officer-requests" ? <h1 className='m-4'>Officer Requests</h1>
                    : reqName === "view-detective-requests" ? <h1 className='m-4'>Detective Requests</h1>
                    : <h1 className='m-4'>Requests</h1>}
            </div>

            {/* request cards */}
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