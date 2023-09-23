import React from 'react';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useParams } from 'react-router-dom';

const CaseDetailsPage = () => {
  const { caseId } = useParams();
  return (
    <div className=''>
      <div className='m-4 d-flex flex-row justify-content-between'>
        <h2>Case Number: {caseId}</h2>
        <DropdownButton id="edit-case-detail" title="Edit Case Detail" className='me-5'>
          <Dropdown.Item href={`/add-evidence/${caseId}`}>Add Evidence</Dropdown.Item>
          <Dropdown.Item href={`/add-participant/${caseId}`}>Add Participant</Dropdown.Item>
        </DropdownButton>
      </div>

      <Form className='m-5'>
        <Form.Group className="mb-4" controlId="exampleForm.ControlTextarea1">
          <Form.Label>Details</Form.Label>
          <Form.Control as="textarea" rows={3} className='ms-2' />
        </Form.Group>
      </Form>

      <div className="d-flex justify-content-end me-5 mb-5">
        <button className='btn btn-primary me-md-3 w-25' type='button'>Save</button>
      </div>
    </div>
  );
};

export default CaseDetailsPage;