import React, { useState } from 'react';
import AddInfo from './AddInfo';

const AddVictim = () => {
  // const [participantInfo, setParticipantInfo] = useState({ name: '', detail: '',  category: ''});
  const categoryArray = ['Suspect', 'Witness', 'Perpetrator', 'Victim']


  return (
    <div>
      <AddInfo heading="Add Participant" namePlaceholder="Participant's Name" detailPlaceholder="Participant's Details" categoryArray={categoryArray}/>
    </div>
  );
};

export default AddVictim;
