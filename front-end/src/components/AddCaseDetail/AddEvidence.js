import React, {useState} from 'react'
import AddInfo from './AddInfo'
import { useParams } from 'react-router-dom';

export const AddEvidence = () => {
  const {caseId} = useParams();
  // const [evidenceInfo, setEvidenceInfo] = useState({name: '', contact: '', category: ''});
  const categoryArray = ['Select a Category', 'Weapon', 'Physical', 'Drug', 'Documentary', 'Hearsay', 'Murder Weapon']

  return (
    <div>
      <AddInfo heading={`Add Evidence for Case# ${caseId}`} IdPlaceholder="Evidence's Id" detailPlaceholder="Evidence's Details" categoryArray={categoryArray} caseId={caseId} name="Evidence"/>
    </div>
  )
}

export default AddEvidence;
