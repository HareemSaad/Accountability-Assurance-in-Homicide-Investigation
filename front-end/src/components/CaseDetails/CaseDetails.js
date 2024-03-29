import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import "./CaseDetails.css"
import { client } from '../data/data';
import { participantTypeMap, evidenceTypeMap, officerTypeMap, caseStatusMap } from '../data/data';
import { notify } from '../utils/error-box/notify';

const CaseDetailsPage = () => {
  const { caseId } = useParams();
  let navigate = useNavigate();

  const [caseOfficer, setCaseOfficer] = useState([]);
  const [caseEvidence, setCaseEvidence] = useState([]);
  const [caseParticipant, setCaseParticipant] = useState([]);
  const [caseStatus, setCaseStatus] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);

  // useEffect(async () => {
  //   // console.log("data cases:: ", caseQuery);
  //   console.log("data officer:: ", caseOfficer);
  //   console.log("data evidence:: ", caseEvidence);
  //   console.log("data participant:: ", caseParticipant);
  // }, [caseOfficer, caseEvidence, caseParticipant]);

  async function fetchData() {
    try {
      const query = `
      query {
        cases(where: {id: "${caseId}"}) {
          status
          officers {
            id
            name
            rank
          }
          participants {
            id
            category
            approve
          }
          evidences {
            id
            category
            approve
          }
        }
      }
      `
      const response = await client.query(query).toPromise();
      const { data, fetching, error } = response;
      // console.log("data:: ", data.cases[0].status)
      // console.log("data evidence:: ", data.cases[0].evidences)
      // console.log("data participant:: ", data.cases[0].participants)
      if (data.cases.length > 0) {
        console.log("first")
        setCaseOfficer(data.cases[0].officers);
        setCaseEvidence(data.cases[0].evidences);
        setCaseParticipant(data.cases[0].participants);
        setCaseStatus(data.cases[0].status);
      } else {
        console.log("No data received.")
      }
    } catch (error) {
      console.log(error);
      notify("error", "Failed to get case details")
    }
  }

  const goto = (e) => {
    const { name } = e.target;
    console.log("params ::", name, caseId)
    
    switch (name) {
      case "change-case-status":
        navigate(`/${name}/${caseId}`);
        break;
      case "add-officer-in-case":
        navigate(`/add-officer-in-case/${caseId}`);
        break;
      case "drop-officer-from-case":
        navigate(`/drop-officer-from-case/${caseId}`);
        break;
      case "add-participant":
        navigate(`/add-participant/${caseId}`);
        break;
      case "add-evidence":
        navigate(`/add-evidence/${caseId}`);
        break;
      default:
        break;
    }
  }

  const toParticipant = async (id) => {
    navigate(`/view-participant/${caseId}/${id}`);
  };

  const toEvidence = async (id) => {
    navigate(`/view-evidence/${caseId}/${id}`);
  };

  return (
    <div className=''>
      {/* case Number and change status button */}
      <div className="d-flex justify-content-between">
        <div className='m-4 d-flex flex-row'> 
          {/* heading and case status */}
          <h2 className='headingCase'>Case Number: {caseId} <span className={`statusTag${caseStatusMap.get(caseStatus)} ms-4`}>#{(caseStatusMap.get(caseStatus))}</span> </h2>
        </div>
        {localStorage.getItem("rank") && (<button className='case-nav-btn m-4' name="change-case-status" onClick={(e) => goto(e)}>Change Status</button>)}
      </div>


      {/* officer, detective on case */}
      <div className='backgound-div'>
        <h3 style={{ textAlign: 'center' }} className='mb-4'>Team</h3>
        <div className='card-info-container'>
          {caseOfficer.length > 0 ? caseOfficer.map((employee, index) => (
            <Card style={{ width: '18rem', height: '9rem' }} className='case-info-card'>
              <Card.Body>
                <Card.Title>{employee.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{officerTypeMap[employee.rank]}</Card.Subtitle>
              </Card.Body>
            </Card>
          )) :
            <h4 style={{ textAlign: 'center' }} className='mb-2 mt-4'><em>No Officer is this Case</em></h4>
          }
        </div>

        {localStorage.getItem("rank") === "Captain" && (<div className='d-flex justify-content-around mt-5'>
          <button className='case-nav-btn' name="add-officer-in-case" onClick={(e) => goto(e)}>Add to Team</button>
          <button className='case-nav-btn' name="drop-officer-from-case" onClick={(e) => goto(e)}>Drop from Team</button>
        </div>)
        }
      </div>

      {/* list of participant */}
      <div className='backgound-div'>
        <h3 style={{ textAlign: 'center' }} className='mb-4 mt-4'>Participants</h3>
        <div className='card-info-container'>
          {caseParticipant.length > 0 ? caseParticipant.map((participant, index) => (
            <Card style={{ width: '18rem', height: 'auto' }} className='case-info-card' onClick={() => toParticipant(participant.id)}>
              <Card.Body>
                <Card.Title>{participant.id}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{participantTypeMap[participant.category]}</Card.Subtitle>
              </Card.Body>
            </Card>
          )) :
            <h4 style={{ textAlign: 'center' }} className='mb-2 mt-4'><em>No Participant
              in this Case</em></h4>
          }
        </div>

        <div className='div-btn'>
          <button className='case-nav-btn' name="add-participant" onClick={(e) => goto(e)}>Add Participant</button>
        </div>
      </div>

      {/* list of evidence */}
      <div className='backgound-div'>
        <h3 style={{ textAlign: 'center' }} className='mb-4 mt-4'>
          Evidence</h3>
        <div className='card-info-container'>
          {caseEvidence.length > 0 ? caseEvidence.map((evidence, index) => (
            <Card style={{ width: '18rem', height: '5rem' }} className='case-info-card' onClick={() => toEvidence(evidence.id)}>
              <Card.Body>
                <Card.Title>{evidence.id}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{evidenceTypeMap[evidence.category]}</Card.Subtitle>
              </Card.Body>
            </Card>
          )) :
            <h4 style={{ textAlign: 'center' }} className='mb-2 mt-4'><em>No Evidence in this Case</em></h4>
          }
        </div>

        <div className='div-btn'>
          <button className='case-nav-btn' name="add-evidence" onClick={(e) => goto(e)}>Add Evidence</button>
        </div>
      </div>

      {/* <div className="row-flex">
        <button className='case-nav-btn' name="add-evidence" onClick={(e) => goto(e)}>Add Evidence</button>
        <button className='case-nav-btn' name="add-participant" onClick={(e) => goto(e)}>Add Participant</button>
      </div> */}
    </div>
  );
};

export default CaseDetailsPage;
