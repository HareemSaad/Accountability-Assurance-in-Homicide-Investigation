import React, { useState } from 'react';
import AddInfo from './AddInfo';

const AddCulprit = () => {
  const [culpritInfo, setCulpritInfo] = useState({ name: '', contact: '' });

  return (
    <div>
      <AddInfo heading="Add Culprit" namePlaceholder="Culprit's Name" detailPlaceholder="Culprit's Contact Details" state={culpritInfo} setState={setCulpritInfo} />
    </div>
  );
};

export default AddCulprit;
