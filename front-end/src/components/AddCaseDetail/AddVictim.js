import React, { useState } from 'react';
import AddInfo from './AddInfo';

const AddVictim = () => {
  const [victimInfo, setVictimInfo] = useState({ name: '', contact: '' });


  return (
    <div>
      <AddInfo heading="Add Victim" namePlaceholder="Victim's Name" detailPlaceholder="Victim's Contact Details" state={victimInfo} setState={setVictimInfo} />
    </div>
  );
};

export default AddVictim;
