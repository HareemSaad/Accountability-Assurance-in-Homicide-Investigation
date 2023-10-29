import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import "./CaseDetails.css"

const CaseDetailsPage = () => {
  const { caseId } = useParams();
  let navigate = useNavigate();

  const employees = [{
    name: "John Doe", batch: "IX", address: "0x443342332535ewfwer3432", rank: "officer"
  }, {
    name: "John Doe", batch: "IX", address: "0x443342332535ewfwer3432", rank: "officer"
  }, {
    name: "John Doe", batch: "IX", address: "0x443342332535ewfwer3432", rank: "officer"
  }, {
    name: "John Doe", batch: "IX", address: "0x443342332535ewfwer3432", rank: "officer"
  },
  {
    name: "Sarah", batch: "X", address: "0x0987837483jdr8388", rank: "Detective"
  },
  {
    name: "Sarah", batch: "X", address: "0x0987837483jdr8388", rank: "Detective"
  },
  {
    name: "Sarah", batch: "X", address: "0x0987837483jdr8388", rank: "Detective"
  },
  {
    name: "Sarah", batch: "X", address: "0x0987837483jdr8388", rank: "Detective"
  }]

  const participants = [{
    participantname: "ben", type: "victim"
  },
  {
    participantname: "ben", type: "victim"
  },
  {
    participantname: "ben", type: "victim"
  },
  {
    participantname: "ben", type: "victim"
  },
  {
    participantname: "david", type: "witness"
  },
  {
    participantname: "david", type: "witness"
  },
  {
    participantname: "david", type: "witness"
  },];
  const evidences = [{
    evidencename: "knife", type: "weapon"
  },
  {
    evidencename: "knife", type: "weapon"
  },
  {
    evidencename: "phone", type: "physical"
  },
  {
    evidencename: "phone", type: "physical"
  }];

  const goto = (e) => {
    const { name } = e.target;
    console.log("params ::", name, caseId)
    navigate(`/${name}/${caseId}`);
  }

  return (
    <div className=''>
      {/* case Number  */}
      <div className='m-4 d-flex flex-row'>
        <h2>Case Number: {caseId}</h2>
        {/* case status */}
        <h6 className='statusTagOpen ms-4'>#OPEN</h6>
      </div>

      {/* officer, detective on case */}
      <div className='backgound-div'>
        <h3 style={{ textAlign: 'center' }} className='mb-4'>Team</h3>
        <div className='card-info-container'>
          {employees.map((employee, index) => (
            <Card style={{ width: '18rem', height: '9rem' }} className='case-info-card'>
              <Card.Body>
                <Card.Title>{employee.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{employee.rank}</Card.Subtitle>
                <Card.Text>
                  {employee.address}
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
      {/* list of participant */}
      <div className='backgound-div'>
        <h3 style={{ textAlign: 'center' }} className='mb-4 mt-4'>Participants</h3>
        <div className='card-info-container'>
          {participants.map((participant, index) => (
            <Card style={{ width: '18rem', height: '5rem' }} className='case-info-card'>
              <Card.Body>
                <Card.Title>{participant.participantname}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{participant.type}</Card.Subtitle>
                {/* <Card.Text>
                  {participant.type}
                </Card.Text> */}
              </Card.Body>
            </Card>
          ))}
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
          {evidences.map((evidence, index) => (
            <Card style={{ width: '18rem', height: '5rem' }} className='case-info-card'>
              <Card.Body>
                <Card.Title>{evidence.evidencename}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{evidence.type}</Card.Subtitle>
                {/* <Card.Text>
                  {participant.type}
                </Card.Text> */}
              </Card.Body>
            </Card>
          ))}
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
