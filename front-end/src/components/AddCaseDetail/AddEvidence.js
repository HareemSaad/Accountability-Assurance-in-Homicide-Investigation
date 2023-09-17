import React, {useState} from 'react'
import AddInfo from './AddInfo'

// id, detail, type
// participant -> id, category/type, data/detail, signature

// submit -> onclick - data in bytes and signature

export const AddEvidence = () => {
  // const [evidenceInfo, setEvidenceInfo] = useState({name: '', contact: '', category: ''});
  const categoryArray = ['Weapon', 'Physical', 'Drug', 'Documentary', 'Hearsay', 'Murder Weapon']

  return (
    <div>
      <AddInfo heading="Add Evidence" namePlaceholder="Evidence's Name" detailPlaceholder="Evidence's Details" categoryArray={categoryArray}/>
    </div>
  )
}

export default AddEvidence;
