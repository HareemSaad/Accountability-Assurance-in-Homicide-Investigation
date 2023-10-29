import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import './AddOfficer.css';
import Dropdown from 'react-bootstrap/Dropdown';

export const AddOfficer = () => {

    let navigate = useNavigate();

    const [selectedStatusValue, setSelectedStatusValue] = useState(null);
    const [selectedRankValue, setSelectedRankValue] = useState(null);
    const [officerInfo, setOfficerInfo] = useState({
        address: '',
        name: '',
        status: '',
        rank: '',
        batch: '',
    });
    const rankArray = ['Null', 'Officer', 'Detective', 'Captain'];
    const statusArray = ['Inactive', 'Active', 'Retired', 'Fired'];
    const officerContractAddress = process.env.REACT_APP_OFFICER_CONTRACT;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOfficerInfo({ ...officerInfo, [name]: value });
        console.log("params :: ", name)
        console.log("value :: ", value)
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (officerInfo.name === '') {
            notify("error", `Officer Name is empty`);
        } else {
            console.log("Officer Name :: ", officerInfo.name)
        }
    }

    // Function to handle dropdown item selection
    const handleStatusDropdownSelect = (categoryValue) => {
        setSelectedStatusValue(categoryValue);
        const name = 'category';
        setOfficerInfo({ ...officerInfo, [name]: categoryValue });
    };

    // Function to handle dropdown item selection
    const handleRankDropdownSelect = (categoryValue) => {
        setSelectedRankValue(categoryValue);
        const name = 'category';
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
                        <input type="text" name='batch' id="officerBatch" placeholder='Enter officer Batch Here' className="form-control" onChange={handleChange}></input>
                    </div>
                </div>

                {/* Officer Status dropdown */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="officerStatus" className="col-form-label"><b><em>Officer Status:</em></b></label>
                    </div>

                    <div className="col-9">
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="officerStatus" className='dropdown'> {selectedStatusValue ? statusArray[selectedStatusValue] : 'Select a Status'} </Dropdown.Toggle>

                            <Dropdown.Menu className='dropdown'>
                                {statusArray.map((category, index) => (
                                    <Dropdown.Item name='status' key={index} onClick={() => handleStatusDropdownSelect(index)}> {category} </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
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


                <button className='btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2' type="submit" onClick={(e) => handleSubmit(e)}>
                    Add Officer
                </button>

            </form>
        </div>
    );

}
