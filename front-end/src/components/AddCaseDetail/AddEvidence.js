import React, {useState} from 'react'
import AddInfo from './AddInfo'

export const AddEvidence = () => {
  const [evidenceInfo, setEvidenceInfo] = useState({name: '', contact: ''});
  return (
    <div>
      <AddInfo heading="Add Evidence" namePlaceholder="Evidence's Name" detailPlaceholder="Evidence's Details" state={evidenceInfo} setState={setEvidenceInfo} />
    </div>
  )
}

export default AddEvidence;
