import React, { useState } from 'react';
import AddInfo from './AddInfo';
import { useParams } from 'react-router-dom';

const AddParticipant = () => {
  const {caseId} = useParams();
  // const [participantInfo, setParticipantInfo] = useState({ name: '', detail: '',  category: ''});
  const categoryArray = ['Suspect', 'Witness', 'Perpetrator', 'Victim']


  return (
    <div>
      <AddInfo heading={`Add Participant for Case# ${caseId}`} IdPlaceholder="Participant's Id" detailPlaceholder="Participant's Details" categoryArray={categoryArray} caseId={caseId}/>
    </div>
  );
};

export default AddParticipant;
