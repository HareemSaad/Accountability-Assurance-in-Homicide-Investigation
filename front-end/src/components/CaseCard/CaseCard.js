import React, { useState, useEffect } from 'react'
import './CaseCard.css'
import CaseDetailsPage from '../CaseDetails/CaseDetails';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";

export const CaseCard = (props) => {

  const [card, setCard] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    const cards = [213, 345, 66, 789, 545, 22, 431];
    setCard(cards)
  }, []);

  function print(cardId) {
    navigate(`/case-detail/${cardId}`);
  }

  return (
    <>
      <h1 className='m-4'>Cases</h1>
      <div className='card-container'>
        {
          card.map((card, index) => (
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
