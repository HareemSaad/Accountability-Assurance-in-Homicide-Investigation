import React, { useContext, useState, useEffect } from 'react'
import { Global } from '../../global/GlobalContext';
import './CaseCard.css'
import CaseDetailsPage from '../CaseDetails/CaseDetails';
import Card from 'react-bootstrap/Card';

import { Route, Routes, useNavigate } from "react-router-dom";

export const CaseCard = (props) => {

  const [stateGlobal, setGlobal] = useContext(Global);
  const [card, setCard] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    const cards = [213, 345, 66, 789, 545, 22, 431];
    setCard(cards)
  }, []);

  function print() {
    console.log(stateGlobal.address);
    console.log(stateGlobal);
    navigate('/case-detail');
  }

  return (
    <>
      <h1 className='m-4'>Cases</h1>
      <div className='card-container'>
        {
          card.map((card, index) => (
            <Card className='case-card'>
              <h2 className='mb-3 mt-3 pb-5'>Case# {card}</h2>
              <button className='card-btn' onClick={print}>View</button>
            </Card>
          ))
        }
      </div>
    </>
  )
}
