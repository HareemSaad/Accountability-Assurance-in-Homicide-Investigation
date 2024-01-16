import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { notify } from "./../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import '../AddCase/AddCase.css';
import CaseABI from "./../Cases.json";
import { readContract, signMessage, waitForTransaction, writeContract } from '@wagmi/core'

export const AddOfficerInCase = () => {
    const { caseId } = useParams();
    let navigate = useNavigate();
    const caseContractAddress = process.env.REACT_APP_CASE_CONTRACT;

    const [officerAddress, setOfficerAddress] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOfficerAddress(value.toString());
        // console.log("params :: ", name)
        console.log("value :: ", value.toString())
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(officerAddress === ''){
            notify("error", `Officer Address is empty`);
        } else {
            console.log("Submit")
            try {
                // console.log(caseContractAddress, officerAddress)
                // call contract
                const { hash } = await writeContract({
                    address: caseContractAddress,
                    abi: CaseABI,
                    functionName: 'addOfficerInCase',
                    args: [caseId, officerAddress],
                    chainId: 11155111
                })
                console.log("hash :: ", hash)

                // wait for txn
                const result = await waitForTransaction({
                    hash: hash,
                })
                console.log("Transaction result:", result);
            } catch (error) {
                console.log(error)
                notify('error', 'Transaction Failed')
            }
        }
    }

    return (
        <div className='container'>
            <h2 className='m-3 mt-5 mb-4'>Add Officer to the Team</h2>
            <form>
                {/* Case Number */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="caseNumber" className="col-form-label"><b><em>Case Number</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='id' id="caseNumber" placeholder='Enter Case Number Here' className="form-control" value={caseId} disabled/>
                    </div>
                </div>

                {/* Officer address */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="officerAddress" className="col-form-label"><b><em>Officer Address:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='address' id="officerAddress" placeholder='Enter officer Address Here' className="form-control" onChange={handleChange}></input>
                    </div>
                </div>

                              
                <button className='btn btn-primary d-grid gap-2 col-6 mx-auto m-5 p-2' type="submit" onClick={async (e) => await handleSubmit(e)}>
                    Add Officer to Case
                </button>
                
            </form>
        </div>
    );

}
