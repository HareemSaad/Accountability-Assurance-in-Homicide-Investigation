import React, { useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ethers } from 'ethers';
import CasesABI from './../CasesABI.json';

const AddInfo = ({ heading, IdPlaceholder, detailPlaceholder, categoryArray, caseId, name }) => {

  const [selectedValue, setSelectedValue] = useState(null);
  const [formInfo, setFormInfo] = useState({ Id: '', detail: '', category: '' });
  const casesContractAddress = '0x6F928D56055AE74886376D9302f214a1CEB2028B';

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(casesContractAddress, CasesABI.abi, signer);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInfo({ ...formInfo, [name]: value });
  };

  // Function to handle dropdown item selection
  const handleDropdownSelect = (categoryValue) => {
    setSelectedValue(categoryValue);
    const name = 'category';
    setFormInfo({ ...formInfo, [name]: categoryValue });
  };

  const handleSubmit = async () => {
    try {
      console.log("state: ", formInfo);
      console.log("selectedValue: ", selectedValue);

      // converting the details field from formInfo into bytes32
      const detailBytes32 = ethers.utils.formatBytes32String(formInfo.detail);
      console.log("detailBytes32: ", detailBytes32);

      // converting entire formInfo use state into JSON
      // const formInfoAllJSON = JSON.stringify(formInfo);
      // console.log("formInfoAllJSON: ", formInfoAllJSON);

      // converting formInfo use state into JSON excluding detail because in contract participant and evidence struct doesnt require detail
      const { detail, ...formInfoWithoutDetail } = formInfo; // javaScript object
      console.log("formInfoWithoutDetail: ", formInfoWithoutDetail);

      const formInfoWithoutDetailJSON = JSON.stringify(formInfoWithoutDetail); // json
      console.log("formInfoWithoutDetailJSON: ", formInfoWithoutDetailJSON);

      // Convert the JSON string to bytes
      const formInfoBytes = ethers.utils.toUtf8Bytes(formInfoWithoutDetailJSON);

      // Now you have formInfoBytes as bytes, you can use it as needed
      console.log("formInfoBytes:", formInfoBytes);

      // signing the transaction
      const signature = await signer.signMessage(formInfoBytes);

      // creating the JSON of formInfo(no detail field), bytes of the data and signature
      const formInfoJSON = {
        ...formInfoWithoutDetail,
        data: formInfoBytes,
        signature: signature
      };

      console.log("formInfoJSON: ", formInfoJSON);

      // calling the functions from contract
      if (name === "Participant") {
        try {
          const result = await contract.addParticipant(caseId, formInfoJSON, detailBytes32);
          console.log("Transaction result:", result);
        } catch (error) {
          console.error("Error calling contract function:", error);
        }
      }
      else if (name === "Evidence") {
        try {
          const result = await contract.addParticipant(caseId, formInfoJSON, detailBytes32);
          console.log("Transaction result:", result);
        } catch (error) {
          console.error("Error calling contract function:", error);
        }
      }
    }
    catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='container'>
      <h2 className='m-3'>{heading}</h2>
      <form>
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor={IdPlaceholder} className="col-form-label">{IdPlaceholder}</label>
          </div>
          <div class="col-9">
            <input type="text" name='Id' id={IdPlaceholder} className="form-control" onChange={handleChange} />
          </div>
        </div>

        <div className="row g-3 align-items-center m-3">
          <div class="col-2">
            <label htmlFor={detailPlaceholder} className="col-form-label">{detailPlaceholder}</label>
          </div>
          <div class="col-9">
            <input type="text" name='detail' id={detailPlaceholder} className="form-control" onChange={handleChange} />
          </div>
        </div>

        <div className="row g-3 align-items-center m-3">

          <div className="col-2">
            <label htmlFor="category-type" className="col-form-label">Select Category</label>
          </div>

          <div class="col-9">
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="category-type"> {selectedValue ? selectedValue : 'Select a category'} </Dropdown.Toggle>

              <Dropdown.Menu>
                {categoryArray.map((category, index) => (
                  <Dropdown.Item name='category' key={index} onClick={() => handleDropdownSelect(category)}> {category} </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className='row justify-content-center'>
          <button type="button" className="btn btn-primary m-3 col-2" onClick={() => handleSubmit()}>Submit</button>
        </div>
      </form>
    </div>
  );

}

export default AddInfo;