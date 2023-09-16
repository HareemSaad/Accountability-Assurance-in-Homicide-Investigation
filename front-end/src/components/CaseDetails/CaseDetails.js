import React from 'react';
import AddVictim from '../AddCaseDetail/AddVictim';
import AddCulprit from '../AddCaseDetail/AddCulprit.js';
import AddEvidence from '../AddCaseDetail/AddEvidence';
import AddWitness from '../AddCaseDetail/AddWitness';
import CreateReport from '../AddCaseDetail/CreateReport';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button } from 'bootstrap';

const CaseDetailsPage = () => {
  return (
    <div className=''>
      <div className='m-4 d-flex flex-row justify-content-between'>
        <h2>Case Number</h2>
        <DropdownButton id="edit-case-detail" title="Edit Case Detail" className='me-5'>
          <Dropdown.Item href="/add-evidence">Add Evidence</Dropdown.Item>
          <Dropdown.Item href="/add-victim">Add Victim</Dropdown.Item>
          <Dropdown.Item href="/add-culprit">Add Culprit</Dropdown.Item>
          <Dropdown.Item href="/add-witness">Add Witness</Dropdown.Item>
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
