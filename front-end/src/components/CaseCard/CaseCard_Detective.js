import React, { useState, useEffect } from 'react'
import './CaseCard.css'
import CaseDetailsPage from '../CaseDetails/CaseDetails';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";

export const CaseCard_Detective = ({ currentUser }) => {

  const [DetectiveCard, setDetectiveCard] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    const DetectiveCards = [13, 27, 36, 45];
    console.log(`currentUser ${currentUser}`)
    setDetectiveCard(DetectiveCards)
  }, []);

  function print(cardId) {
    navigate(`/case-detail/${cardId}`);
  }



  return (
    <>
        <h1 className='m-4'>Cases</h1>
      

      <div className='card-container'>
        {DetectiveCard.map((card, index) => (
          <Card className='case-card'>
            <h2 className='mb-3 mt-3 pb-5'>Case# {card}</h2>
            <button className='card-btn' onClick={() => print(card)}>View</button>
          </Card>
        ))}


      </div>
    </>
  )
}
