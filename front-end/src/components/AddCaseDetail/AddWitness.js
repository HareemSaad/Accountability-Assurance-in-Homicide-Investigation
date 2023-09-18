import React, { useState } from 'react'
import AddInfo from './AddInfo'

const AddWitness = () => {
    const [witnessInfo, setWitnessInfo] = useState({ name: '', contact: '' });

  return (
    <div>
        <AddInfo heading="Add witness" namePlaceholder="Witness's Name" detailPlaceholder="Witness's Contact Details" state={witnessInfo} setState={setWitnessInfo} />
    </div>
  )
}

export default AddWitness