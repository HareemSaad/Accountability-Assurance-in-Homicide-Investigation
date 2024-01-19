import React, { useState, useEffect } from 'react'
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
// import { useUserContext } from '../Context/userContext.tsx';
import axios from 'axios';
import { useAccount } from "wagmi";

export const CaptainViewTranferRequest = () => {
    const { reqName } = useParams();
    const { address, connector, isConnected } = useAccount();
    // const { user, setUser } = useUserContext();
    console.log("reqName: ", reqName)

    const [allRequests, setAllRequests] = useState([]);
    let navigate = useNavigate();
    // const stateCode = localStorage.getItem("statecode");

    useEffect(() => {
        axios.get(`http://localhost:3000/captain/${reqName}`, 
        { params: {
            "userStateCode": localStorage.getItem("statecode"), 
            "address": address
        }})
        .then(result => {setAllRequests(result.data); console.log("result.data:: ", result.data)})
        .catch(err => console.log("error:: ", err))

        // console.log("stateCode: ", stateCode) 
    }, []);

    function print(cardId) {
        // navigate(`/case-detail/${cardId}`);
        if (reqName === "view-transfer-captain") {
            navigate(`/view-transfer-captain/${cardId}`);
        } 
        else if (reqName === "view-transfer-case") {
            navigate(`/view-transfer-case/${cardId}`);
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
                {reqName === "view-transfer-captain" ? <h1 className='m-4'>Transfer Captain Requests</h1>
                    : reqName === "view-transfer-case" ? <h1 className='m-4'>Transfer Case Requests</h1>
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