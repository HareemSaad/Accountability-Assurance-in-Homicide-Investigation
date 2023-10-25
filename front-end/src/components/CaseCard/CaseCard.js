import React, { useState, useEffect } from 'react'
import './CaseCard.css'
import CaseDetailsPage from '../CaseDetails/CaseDetails';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";

export const CaseCard = ({ currentUser }) => {

  const [OfficerCard, setOfficerCard] = useState([]);
  const [DetectiveCard, setDetectiveCard] = useState([]);
  const [CaptainCard, setCaptainCard] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    const OfficerCards = [213, 345, 66, 789, 545, 22, 431];
    const DetectiveCards = [13, 27, 36, 45];
    const CaptainCards = [444, 777, 666, 888, 999];
    console.log(`currentUser ${currentUser}`)
    setOfficerCard(OfficerCards)
    setDetectiveCard(DetectiveCards)
    setCaptainCard(CaptainCards)
  }, []);

  function print(cardId) {
    navigate(`/case-detail/${cardId}`);
  }

  return (
    <>
      <h1 className='m-4'>Cases</h1>
      <div className='card-container'>
        
        {(currentUser === 'Officer') ?
          OfficerCard.map((card, index) => (
            <Card className='case-card'>
              <h2 className='mb-3 mt-3 pb-5'>Case# {card}</h2>
              <button className='card-btn' onClick={() => print(card)}>View</button>
            </Card>
          )) : (currentUser === 'Detective') ?
          DetectiveCard.map((card, index) => (
              <Card className='case-card'>
                <h2 className='mb-3 mt-3 pb-5'>Case# {card}</h2>
                <button className='card-btn' onClick={() => print(card)}>View</button>
              </Card>
            ))
            :
            CaptainCard.map((card, index) => (
              <Card className='case-card'>
                <h2 className='mb-3 mt-3 pb-5'>Case# {card}</h2>
                <button className='card-btn' onClick={() => print(card)}>View</button>
              </Card>
            ))

        }


      </div>
    </>
  )
}
