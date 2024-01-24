import React, { useState } from 'react'
import './Home.css'
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { readContract } from '@wagmi/core'
import { notify } from "./../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import LedgerABI from "./../Ledger.json";
import { rankMap } from "../data/data.js";
import { getUserDetail } from '../utils/callers/getUserDetail.js';

export const Login = () => {

  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const [isBranchExist, setIsBranchExist] = React.useState(false);
  const [branchId, setBranchId] = React.useState('');
  const [stateCode, setStateCode] = React.useState('');
  const [officerInfo, setOfficerInfo] = useState({
    "stateCode": "",
    "branchId": ""
  })

  let navigate = useNavigate();
  
  const setGlobalVariables = (rank, stateCode, branchId, badge) => {
    localStorage.setItem("rank", rankMap.get(rank));
    localStorage.setItem("rankId", rank);
    localStorage.setItem("statecode", stateCode);
    localStorage.setItem("branchid", branchId);
    localStorage.setItem("badge", badge);
  }

  useEffect(() => {
    console.log("officerInfo:: ", officerInfo)
    console.log("isBranchExist:: ", isBranchExist)

  }, [officerInfo, isBranchExist])
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOfficerInfo({ ...officerInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  }; 

  // Function to handle successful login
  const handleLoginSuccess = async () => {
    try {
      if (isConnected) {
        const userDetails = await getUserDetail(address)
        // console.log("userDetails", userDetails);
        
        const validity = await readContract({
          address: process.env.REACT_APP_LEDGER_CONTRACT,
          abi: LedgerABI,
          functionName: 'isValidEmployment',
          args: [
            userDetails.branchId, // bytes32 _branchId,
            userDetails.statecode, // uint _stateCode
            userDetails.badge, // bytes32 _badge
            userDetails.rank //Rank _rank
          ],
          account: address,
          chainId: 11155111
        })
        console.log("validity ::", validity)
  
        if (validity) {
          if (userDetails.rank  === 3) { navigate('/cases-captain'); setGlobalVariables(userDetails.rank, userDetails.statecode, userDetails.branchId, userDetails.badge); }
          else if (userDetails.rank  === 2) { navigate('/cases-detective'); setGlobalVariables(userDetails.rank, userDetails.statecode, userDetails.branchId, userDetails.badge); }
          else if (userDetails.rank  === 1) { navigate('/cases-officer'); setGlobalVariables(userDetails.rank, userDetails.statecode, userDetails.branchId, userDetails.badge); }
          else if (userDetails.rank  === 4) { navigate('/moderator-home'); setGlobalVariables(userDetails.rank, userDetails.statecode, userDetails.branchId, userDetails.badge); }
          else { handleValidationFail(); }
        } else {
          handleValidationFail();
        }
      };
      
    } catch (error) {
      console.log(error);
      notify("error", "Failed Authentication")
      handleValidationFail();
    }
  
  }  

  // Handler for checkbox change
  const handleBranchExistChange = (e) => {
    setIsBranchExist(e.target.checked);
  };
  
  const handleLogin = (connector) => {
    if (isBranchExist) {
      if (!officerInfo.branchId) {
        notify("error", "Branch Id is required");
      } else if (!officerInfo.stateCode) {
        notify("error", "State Code is required");
      }
    } else {
      connect({ connector });
    }
  };

  const handleValidationFail = () => {
    window.localStorage.clear();
    if(isConnected) {
      disconnect()
    } else {
      notify("error", "Rank validation failed");
    }
  };

  useEffect(() => {
    if (isConnected) {
      handleLoginSuccess();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return (
    <div className='login'>
      <div className='login-container'>
        <h2 className='login-welcome'> Welcome </h2>

        {/* show branchid and statecode if isBranchExists true */}
        {isBranchExist && (
          <div>
            {/* branch id */}
            <div className="input mb-4">
              <input
                type="text"
                name="branchId"
                id="branchId"
                placeholder="Your Branch Id Here"
                className="form-control"
                // onChange={(e) => setBranchId(e.target.value)}
                onChange={handleChange}
              ></input>
            </div>

            {/* state code */}
            <div className="input mb-4">
              <input
                type="number"
                name="stateCode"
                id="stateCode"
                placeholder="Your State Code Here"
                className="form-control"
                // onChange={(e) => setStateCode(e.target.value)}
                onChange={handleChange}
                ></input>
            </div>
          </div>
        )}

        {/* isBranchExist Checkbox */}
        <div className="form-check form-switch">
          <input
            className="form-check-input input mb-4"
            type="checkbox"
            role="switch"
            id="isBranchExist"
            checked={isBranchExist}
            onChange={handleBranchExistChange}
          />
          <label className="form-check-label" htmlFor="isBranchExist">Branch Exists</label>
        </div>

          {/* {error && <div>{error.message}</div>} */}

          {/* Login button */}
        <div>
          {connectors.map((connector) => (
            <button
              disabled={!connector.ready}
              key={connector.id}
              onClick={() => {
                handleLogin(connector)
              }}
              className='login-button'
            >
              {"Login"}
              {!connector.ready && ' (unsupported)'}
              {isLoading &&
                connector.id === pendingConnector?.id &&
                ' (connecting)'}
              {/* {console.log("ID:: ", isConnected)} */}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
