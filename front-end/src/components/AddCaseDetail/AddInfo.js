import React, { useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ethers } from 'ethers';
import CasesABI from '../CasesABI.json';
import { notify } from "./../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import { readContract, signMessage, waitForTransaction, writeContract } from '@wagmi/core'

const AddInfo = ({ heading, IdPlaceholder, detailPlaceholder, categoryArray, caseId, name }) => {

  const [selectedValue, setSelectedValue] = useState(null);
  const [formInfo, setFormInfo] = useState({
    id: '',
    category: '',
    detail: '',
  });
  const casesContractAddress = process.env.REACT_APP_CASE_CONTRACT;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "id") {
      setFormInfo({ ...formInfo, [name]: parseInt(value) });
    } else {
      setFormInfo({ ...formInfo, [name]: value });
    }
  };

  // Function to handle dropdown item selection
  const handleDropdownSelect = (categoryValue) => {
    setSelectedValue(categoryValue);
    const name = 'category';
    setFormInfo({ ...formInfo, [name]: categoryValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      // converting the details field from formInfo into bytes
      const message = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(formInfo.detail)).toString()
      // console.log("message: ", message);

      // signing the transaction
      const signature = await signMessage({ message })
      // console.log("SIG :: ", signature)

      // calling the functions from contract
      if (name === "Evidence") {
        try {

          // get typed hash data
          const hashTypedData = await readContract({
            address: casesContractAddress,
            abi: CasesABI.abi,
            functionName: 'hashTypedDataV4',
            args: [ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['bytes'], [message]))],
            chainId: 11155111
          })
          // console.log("hashTypedData: ", hashTypedData);

          // create evidence struct
          const evidence = {
            evidenceId: formInfo.id,
            category: formInfo.category - 1,
            data: message,
            signature: signature
          }
          // console.log("evidence :: ", evidence)

          // call contract
          const { hash } = await writeContract({
            address: casesContractAddress,
            abi: CasesABI.abi,
            functionName: 'addEvidence',
            args: [caseId, evidence, hashTypedData],
            chainId: 11155111
          })
          console.log("hash :: ", hash)

          // wait for txn
          const result = await waitForTransaction({
            hash: hash,
          })
          console.log("Transaction result:", result);
        } catch (error) {
          console.error("Error calling contract function:", error);
          notify("error", `Transaction Failed`);
        }
      }
      else if (name === "Participant") {
        try {
          // get typed hash data
          const hashTypedData = await readContract({
            address: casesContractAddress,
            abi: CasesABI.abi,
            functionName: 'hashTypedDataV4',
            args: [ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['bytes'], [message]))],
            chainId: 11155111
          })
          // console.log("hashTypedData: ", hashTypedData);

          // create evidence struct
          const participant = {
            suspectId: formInfo.id,
            category: formInfo.category - 1,
            data: message,
            signature: signature
          }
          console.log("participant :: ", participant)

          // call contract
          const { hash } = await writeContract({
            address: casesContractAddress,
            abi: CasesABI.abi,
            functionName: 'addParticipant',
            args: [caseId, participant, hashTypedData],
            chainId: 11155111
          })
          console.log("hash :: ", hash)

          // wait for txn
          const result = await waitForTransaction({
            hash: hash,
          })
          console.log("Transaction result:", result);
        } catch (error) {
          console.error("Error calling contract function:", error);
          notify("error", `Transaction Failed`);
        }
      } else {
        notify("error", `Case Number is empty`);
      }
    }
    catch (error) {
      console.error(error);
      notify("error", `Submission Failed`);
    }
  };

  return (
    <div className='container'>
      <h2 className='m-3'>{heading}</h2>
      <form>
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor={IdPlaceholder} className="col-form-label"><b><em>{IdPlaceholder}</em></b></label>
          </div>
          <div className="col-9 input">
            <input type="text" name='id' id={IdPlaceholder} placeholder={IdPlaceholder} className="form-control" onChange={handleChange} />
          </div>
        </div>

        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor={detailPlaceholder} className="col-form-label"><b><em>{detailPlaceholder}</em></b></label>
          </div>
          <div className="col-9 input">
            <input type="text" name='detail' id={detailPlaceholder} placeholder={detailPlaceholder} className="form-control" onChange={handleChange} />
          </div>
        </div>

        <div className="row g-3 align-items-center m-3">

          <div className="col-2">
            <label htmlFor="category-type" className="col-form-label"><b><em>Select Category</em></b></label>
          </div>

          <div className="col-9">
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="category-type" className='dropdown'> {selectedValue ? categoryArray[selectedValue] : 'Select a Category'} </Dropdown.Toggle>

              <Dropdown.Menu className='dropdown'>
                {categoryArray.map((category, index) => (
                  <Dropdown.Item name='category' key={index} onClick={() => handleDropdownSelect(index)}> {category} </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <button className='btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2' type="submit" onClick={async (e) => await handleSubmit(e)}>
          Save
        </button>
      </form>


    </div>
  );

}

export default AddInfo;