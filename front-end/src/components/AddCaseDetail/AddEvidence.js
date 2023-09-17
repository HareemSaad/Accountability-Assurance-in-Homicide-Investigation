import React, {useState} from 'react'
import AddInfo from './AddInfo'
import { useParams } from 'react-router-dom';

// id, detail, type
// participant -> id, category/type, data/detail, signature

// submit -> onclick - data in bytes and signature

export const AddEvidence = () => {
  const {caseId} = useParams();
  // const [evidenceInfo, setEvidenceInfo] = useState({name: '', contact: '', category: ''});
  const categoryArray = ['Weapon', 'Physical', 'Drug', 'Documentary', 'Hearsay', 'Murder Weapon']

  return (
    <div>
      <AddInfo heading={`Add Evidence for Case# ${caseId}`} IdPlaceholder="Evidence's Id" detailPlaceholder="Evidence's Details" categoryArray={categoryArray} caseId={caseId}/>
    </div>
  )
}

export default AddEvidence;
