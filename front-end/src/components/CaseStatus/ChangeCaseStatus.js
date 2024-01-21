import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { notify } from "./../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import { waitForTransaction, writeContract } from '@wagmi/core'
import CaseABI from "./../Cases.json";
import { caseStatusMap } from '../data/data';

export const ChangeCaseStatus = () => {
    const { caseId } = useParams();
    let navigate = useNavigate();

    const [caseStatus, setcaseStatus] = useState("");

    // Function to handle dropdown item selection
    const [selectedStatusValue, setSelectedStatusValue] = useState(null);

    // useEffect(() => {
    //     console.log("caseStatus: ", caseStatus)
    //     console.log("selectedStatusValue: ", selectedStatusValue)
    // }, [selectedStatusValue])
      

    const handleDropdownSelect = (statusValue) => {
        setSelectedStatusValue(statusValue);
        setcaseStatus(statusValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (caseStatus === '') {
            notify("error", `Select From Dropdown`);
        } else {
            console.log("caseStatus ::", caseStatus)
        }
        try {
          const { hash } = await writeContract({
              address: process.env.REACT_APP_CASE_CONTRACT,
              abi: CaseABI,
              functionName: 'updateCaseStatus',
              args: [caseId, caseStatus],
              chainId: 11155111
          })
          console.log("hash :: ", hash)
    
          // wait for txn
          const result = await waitForTransaction({
              hash: hash,
          })
          console.log("Transaction result:", result);
          notify('success', 'Transaction Success')
          
        } catch (error) {
          console.log(error);
          notify("error", "Error in submitting the form")
        }
    }

    return (
        <div className='container'>
            {/* Heading */}
            <h2 className='m-3 mt-5 mb-4'>Change Case Status</h2>
            <form>
                {/* Case Number */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="caseNumber" className="col-form-label"><b><em>Case Number</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='id' id="caseNumber" placeholder='Enter Case Number Here' className="form-control" value={caseId} disabled />
                    </div>
                </div>

                {/* Change Case Status */}
                <div className="row g-3 align-items-center m-3">

                    <div className="col-2">
                        <label htmlFor="category-type" className="col-form-label"><b><em>Select Status</em></b></label>
                    </div>

                    <div className="col-9">
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="category-type" className='dropdown'> {selectedStatusValue ? caseStatusMap.get(selectedStatusValue) : "Select Case Status"} </Dropdown.Toggle>

                            <Dropdown.Menu className='dropdown'>
                                {Array.from(caseStatusMap).map(([key, value]) => (
                                    <Dropdown.Item name='category' key={key} onClick={() => handleDropdownSelect(key)}> {value} </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>


                <button className='btn btn-primary d-grid gap-2 col-6 mx-auto m-5 p-2' type="submit" onClick={async (e) => await handleSubmit(e)}>
                    Save Case Status
                </button>

            </form>
        </div>
    );

}
