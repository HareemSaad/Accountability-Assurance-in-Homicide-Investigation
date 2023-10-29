import React, { useState, useEffect } from 'react'
import './CaseCard.css'
import CaseDetailsPage from '../CaseDetails/CaseDetails';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";

export const CaseCard_Captain = () => {

    const [CaptainCard, setCaptainCard] = useState([]);
    let navigate = useNavigate();

    useEffect(() => {
        const CaptainCards = [213, 192, 615, 888, 999];
        setCaptainCard(CaptainCards)
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
                <h1 className='m-4'>Cases</h1>
                <div className="d-flex">
                    <button className='card-add-btn' name="add-case" onClick={(e) => goto(e)}>Add Case</button>
                    <button className='card-add-btn' name="add-officer" onClick={(e) => goto(e)}>Add Officer</button>
                </div>
            </div>

            <div className='card-container'>
                {CaptainCard.map((card, index) => (
                    <Card className='case-card'>
                        <h2 className='mb-3 mt-3 pb-5'>Case# {card}</h2>
                        <button className='card-btn' onClick={() => print(card)}>View</button>
                    </Card>
                ))}


            </div>
        </>
    )
}
