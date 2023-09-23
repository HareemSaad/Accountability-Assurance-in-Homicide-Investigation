import React, { useState } from 'react';
import AddInfo from './AddInfo';
import { useParams } from 'react-router-dom';

const AddParticipant = () => {
  const {caseId} = useParams();
  const categoryArray = ['Select a Category', 'Suspect', 'Witness', 'Perpetrator', 'Victim']

  return (
    <div>
      <AddInfo heading={`Add Participant for Case# ${caseId}`} IdPlaceholder="Participant's Id" detailPlaceholder="Participant's Details" categoryArray={categoryArray} caseId={caseId} name="Participant"/>
    </div>
  );
};

export default AddParticipant;
