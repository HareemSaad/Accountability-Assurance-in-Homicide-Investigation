import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import './AddOfficer.css';
import Dropdown from 'react-bootstrap/Dropdown';
import OfficersABI from "./../OfficersABI.json";
import { readContract, signMessage, waitForTransaction, writeContract } from '@wagmi/core'

export const AddOfficer = () => {

    let navigate = useNavigate();

    const [selectedStatusValue, setSelectedStatusValue] = useState(null);
    const [selectedRankValue, setSelectedRankValue] = useState(null);
    const [officerInfo, setOfficerInfo] = useState({
        address: '',
        name: '',
        rank: '',
        badge: '',
    });
    const rankArray = ['Null', 'Officer', 'Detective', 'Captain'];
    const statusArray = ['Inactive', 'Active', 'Retired', 'Fired'];
    const officerContractAddress = process.env.REACT_APP_OFFICER_CONTRACT;
    const RoleBytes = {
        3: "0xd1caa20fe64a17576895d331b6b815baf91df37730e70e788978bc77ac7559b4",
        2: "0x9bcceb74634ac977676ecaf8900febd8cc8358719b06c206b86e9e10f6758bc2",
        1: "0xbbecb2568601cb27e6ced525237c463da94c4fb7a9b98ac79fd30fd56d8e1b53",
        0: "",
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOfficerInfo({ ...officerInfo, [name]: value });
        console.log("params :: ", name)
        console.log("value :: ", value)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (officerInfo.name === '') {
            notify("error", `Officer Name is empty`);
        } else if (officerInfo.address === '') {
            notify("error", `Officer Address is empty`);
        } else if (officerInfo.rank === '' || officerInfo.rank === 0) {
            notify("error", `Select Officer Rank`);
        } else if (officerInfo.badge === '') {
            notify("error", `Badge Number is empty`);
        }
        console.log(officerInfo)
        // call contract
        const { hash } = await writeContract({
            address: officerContractAddress,
            abi: OfficersABI.abi,
            functionName: 'onboard',
            args: [officerInfo.address, officerInfo.name, officerInfo.badge, RoleBytes[officerInfo.rank]],
            chainId: 11155111
        })
        console.log("hash :: ", hash)

        // wait for txn
        const result = await waitForTransaction({
            hash: hash,
        })
        console.log("Transaction result:", result);
    }

    // Function to handle dropdown item selection
    const handleRankDropdownSelect = (categoryValue) => {
        setSelectedRankValue(categoryValue);
        const name = 'rank';
        setOfficerInfo({ ...officerInfo, [name]: categoryValue });
    };

    return (
        <div className='container'>
            <h2 className='m-3'>Add Officer</h2>
            <form>
                {/* Officer address */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="officerAddress" className="col-form-label"><b><em>Officer Address:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='address' id="officerAddress" placeholder='Enter officer Address Here' className="form-control" onChange={handleChange}></input>
                    </div>
                </div>

                {/* Officer Name */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="officerName" className="col-form-label"><b><em>Officer Name:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='name' id="officerName" placeholder='Enter officer Name Here' className="form-control" onChange={handleChange}></input>
                    </div>
                </div>

                {/* Officer Batch */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="officerRank" className="col-form-label"><b><em>Officer Batch:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='badge' id="officerBatch" placeholder='Enter officer Batch Here' className="form-control" onChange={handleChange}></input>
                    </div>
                </div>

                {/* Officer Rank dropdown */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="officerRank" className="col-form-label"><b><em>Officer Rank:</em></b></label>
                    </div>

                    <div className="col-9">
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="officerRank" className='dropdown'> {selectedRankValue ? rankArray[selectedRankValue] : 'Select a Rank'} </Dropdown.Toggle>

                            <Dropdown.Menu className='dropdown'>
                                {rankArray.map((category, index) => (
                                    <Dropdown.Item name='rank' key={index} onClick={() => handleRankDropdownSelect(index)}> {category} </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>


                <button className='btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2' type="submit" onClick={async (e) => await handleSubmit(e)}>
                    Add Officer
                </button>

            </form>
        </div>
    );

}
