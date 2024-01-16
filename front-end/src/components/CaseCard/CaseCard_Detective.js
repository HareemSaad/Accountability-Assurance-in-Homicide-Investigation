import React, { useState, useEffect, useContext } from 'react'
import './CaseCard.css'
import CaseDetailsPage from '../CaseDetails/CaseDetails';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom"; 

export const CaseCard_Detective = ({ currentUser }) => {

  const [DetectiveCard, setDetectiveCard] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    const DetectiveCards = [{ id: 13, status: "Open" }, { id: 27, status: "Open" }, { id: 36, status: "Open" }, { id: 45, status: "Open" }];
    console.log(`currentUser ${currentUser}`)
    setDetectiveCard(DetectiveCards)
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
        <h1 className='m-4'>Cases -- {localStorage.getItem("rank")}</h1>
        <div className="d-flex">
          <button className='card-add-btn' name="archive-cases" onClick={(e) => goto(e)}>Archive Cases</button>
        </div>
      </div>

      <div className='card-container'>
        {DetectiveCard.map((card, index) => (
          <Card className='case-card'>
            <h2 className='mb-3 mt-3 pb-5'>Case# {card.id}</h2>
            <button className='card-btn' onClick={() => print(card.id, card.status)}>View</button>
          </Card>
        ))}
      </div>
    </>
  )
}