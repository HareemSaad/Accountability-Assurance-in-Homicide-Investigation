import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import { notify } from "./../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import './AddCase.css';
import CaseABI from "./../Cases.json";
import { waitForTransaction, writeContract } from '@wagmi/core';

export const AddCase = () => {

    let navigate = useNavigate();

    const [caseNum, setCaseNum] = useState({ id: '' });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCaseNum({ ...caseNum, [name]: parseInt(value) });
        console.log("params :: ", name)
        console.log("value :: ", value)
    };

    const handleNavigate = (e) => {
        e.preventDefault();
        const { name } = e.target;
        if (caseNum.id === '') {
            // console.log("null");
            notify("error", `Enter Case First`);
        } else {
            // console.log("caseNum :: ", caseNum.id)
            // console.log(`navigation:: /${name}/${caseNum.id}`);
            navigate(`/${name}/${caseNum.id}`);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (caseNum.id === '') {
            // console.log("null");
            notify("error", `Case Number is empty`);
        } 
        
        try {
            // call contract
            const { hash } = await writeContract({
                address: process.env.REACT_APP_CASE_CONTRACT,
                abi: CaseABI,
                functionName: 'addCase',
                args: [caseNum.id, localStorage.getItem("branchId")],
                chainId: 11155111
            })
            console.log("hash :: ", hash)

            // wait for txn
            const result = await waitForTransaction({
                hash: hash,
            })
            console.log("Transaction result:", result);
        } catch (error) {
            console.log(error);
            notify('error', "Failed to add case");
        }
        notify('success', "Added case successfully");
    }

    return (
        <div className='container'>
            <h2 className='m-3 mt-5 mb-4'>Add Case</h2>
            <form>
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="caseNumber" className="col-form-label"><b><em>Case Number</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='id' id="caseNumber" placeholder='Enter Case Number Here' className="form-control" onChange={handleChange} />
                    </div>
                </div>

                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="caseStatus" className="col-form-label"><b><em>Case Status</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='status' id="caseStatus" className="form-control" value="Open" disabled />
                    </div>
                </div>

                <div className='d-flex justify-content-around mt-4 ms-5'>
                    <button className='case-add-btn' name="add-evidence" onClick={(e) => handleNavigate(e)}>Add Evidence</button>
                    <button className='case-add-btn' name="add-participant" onClick={(e) => handleNavigate(e)}>Add Participant</button>
                </div>
                
                <button className='btn btn-primary d-grid gap-2 col-6 mx-auto m-5 p-2' type="submit" onClick={async (e) => await handleSubmit(e)}>
                    Save Case
                </button>
                
            </form>
        </div>
    );

}
