import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import "./CaseDetails.css"

const CaseDetailsPage = () => {
  const { caseId } = useParams();
  let navigate = useNavigate();

  const goto = (e) => {
    const { name } = e.target;
    console.log("params ::", name, caseId)
    navigate(`/${name}/${caseId}`);
  }

  return (
    <div className=''>
      <div className='m-4 d-flex flex-row justify-content-between'>
        <h2>Case Number: {caseId}</h2>
      </div>
      <div className="row-flex">
        <button className='case-nav-btn' name="add-evidence" onClick={(e) => goto(e)}>Add Evidence</button>
        <button className='case-nav-btn' name="add-participant" onClick={(e) => goto(e)}>Add Participant</button>
      </div>
    </div>
  );
};

export default CaseDetailsPage;
