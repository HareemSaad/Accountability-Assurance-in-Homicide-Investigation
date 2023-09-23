import React, { useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ethers } from 'ethers';
import CasesABI from '../CasesABI.json';
import { useSignMessage } from 'wagmi'
import { recoverMessageAddress, parseEther } from 'viem'
import { sendTransaction, prepareSendTransaction, signMessage, waitForTransaction, writeContract } from '@wagmi/core'

const AddInfo = ({ heading, IdPlaceholder, detailPlaceholder, categoryArray, caseId, name }) => {

  // const { data: signMessageData, error, isLoading, signMessage, variables } = useSignMessage()

  const [selectedValue, setSelectedValue] = useState(null);
  const [formInfo, setFormInfo] = useState({ evidenceId: '', category: '', detail: '' });
  const casesContractAddress = '0xC7134892CCfbbeBAC31675D91F239Fcd03E609de';

  // const { ethereum } = window;
  const _provider = new ethers.getDefaultProvider('https://eth-sepolia.g.alchemy.com/v2/CQE6KMqsDb-cXFzKjTK1RWNWp0fVnO41');
  const _signer = new ethers.Wallet('0x62f724df34d4310ce079f34ccfb378a652891de7741e24a703af4b33b9be1f07', _provider);
  const _contract = new ethers.Contract(casesContractAddress, CasesABI.abi, _signer);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInfo({ ...formInfo, [name]: value });
  };

  const handleIdChange = (e) => {
    const { name, value } = e.target;
    setFormInfo({ ...formInfo, [name]: parseInt(value) });
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
      const detailBytes = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(formInfo.detail)).toString()
      console.log("detailBytes: ", detailBytes);

      // converting formInfo use state into JSON excluding detail because in contract participant and evidence struct doesnt require detail
      const { detail, ...formInfoWithoutDetail } = formInfo; // javaScript object
      console.log("formInfoWithoutDetail: ", formInfoWithoutDetail);

      const formInfoWithoutDetailJSON = JSON.stringify(formInfoWithoutDetail); // json
      console.log("formInfoWithoutDetailJSON: ", formInfoWithoutDetailJSON);

      // Convert the JSON string to bytes
      // const formInfoBytes = ethers.utils.toUtf8Bytes(formInfoWithoutDetailJSON);

      // Now you have formInfoBytes as bytes, you can use it as needed
      // console.log("formInfoBytes:", formInfoBytes);

      // signing the transaction
      const message = detailBytes
      const signature = await signMessage({ message })
      console.log("SIG :: ", signature) //0x355b1d51542608bed19c98d6181d14a64a6dadf33c15d622eca5d475146eb9d53b98bb4ba64f4d9bd5d6a0b95591c3d17188842095604bf69b2362ed6ba19aaa1b
      // creating the JSON of formInfo(no detail field), bytes of the data and signature
      const formInfoJSON = {
        ...formInfoWithoutDetail,
        data: detailBytes,
        signature: signature.toString()
      };

      console.log("formInfoJSON: ", formInfoJSON);

      // calling the functions from contract
      if (name === "Evidence") {
        try {

          // const domainSeparator = "0x6470b53cb3e4258c83fa400dca28fab95f0facac27bbeb0dbfdb4854a4ac12f0";
          const tdh = await _contract.hashTypedDataV4(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['bytes'], [detailBytes])));
          console.log("tdh: ", tdh);
          console.log("struct: ", formInfoJSON);
    
          const temp = {
            evidenceId: formInfoJSON.evidenceId,
            category: formInfoJSON.category,
            data: formInfoJSON.data,
            signature: formInfoJSON.signature
          }
          console.log("temp :: ", temp)
          const { hash } = await writeContract({
            address: casesContractAddress,
            abi: CasesABI.abi,
            functionName: 'addEvidence',
            args: [caseId, temp, tdh],
            chainId: 11155111
          })
          console.log("hash :: ", hash)
          const result = await waitForTransaction({
            hash: hash,
          })
          console.log("Transaction result:", result);
        } catch (error) {
          console.error("Error calling contract function:", error);
        }
      }
      else if (name === "Participant") {
        try {
          const res = await fetch("http://localhost:3000/addEvidence", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                caseId: caseId,
                formInfoJSON: formInfoJSON,
                detailBytes: detailBytes
            })
            //above variables should be same in const {Username, Password, Email} = req.body when loading this function (in express file)
          })
          // const result = await _contract.addParticipant(
          //   caseId, 
          //   formInfoJSON, 
          //   detailBytes);
          console.log("Transaction result:", res);
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
            <input type="text" name='evidenceId' id={IdPlaceholder} className="form-control" onChange={handleIdChange} />
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
                  <Dropdown.Item name='category' key={index} onClick={() => handleDropdownSelect(index)}> {category} </Dropdown.Item>
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