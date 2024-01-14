import React from 'react'
import './Home.css'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { readContract } from '@wagmi/core'
import { notify } from "./../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import LedgerABI from "./../Ledger.json";
import { stateCodeMap, rankMap, branchIdMap } from "../data/data.js";

// CONTEXTS - Global Variables
import { UserContext, useUserContext } from '../Context/userContext.tsx';
import { UserBadgeContext, useUserBadgeContext } from '../Context/userBadgeContext.tsx';
import { UserBranchIdContext, useUserBranchIdContext } from '../Context/userBranchIdContext.tsx';
import { StateCodeContext, useStateCodeContext } from '../Context/stateCodeContext.tsx';

export const Login = () => {
  const { user, setUser } = useUserContext();
  const { userBadge, setUserBadge } = useUserBadgeContext();
  const { userBranchId, setUserBranchId } = useUserBranchIdContext();
  const { stateCode, setStateCode } = useStateCodeContext();

  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { address, connector, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  let navigate = useNavigate();
  
  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [officerInfo, setOfficerInfo] = useState({
    rank: 0,
    branchId: 0,
    stateCode: 0,
    badge: "",
  });

  // Function to handle dropdown item selection
  const handleDropdownSelect = async (value) => {
    setSelectedValue(rankMap.get(value));
    const name = "rank";
    setOfficerInfo({ ...officerInfo, [name]: value });
  };

  const handleStateCodeDropdownSelect = (categoryValue) => {
    setSelectedStateCode(categoryValue);
    const name = "stateCode";
    setOfficerInfo({ ...officerInfo, [name]: categoryValue });
  }

  const handleBranchIdDropdownSelect = (categoryValue) => {
    setSelectedBranchId(categoryValue);
    const name = "branchId";
    setOfficerInfo({ ...officerInfo, [name]: categoryValue });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOfficerInfo({ ...officerInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  }; 

  const setGlobalVariables = () => {
    setUser(selectedValue);
    setStateCode(stateCodeMap.get(officerInfo.stateCode));
    setUserBranchId(branchIdMap.get(officerInfo.branchId));
    setUserBadge(officerInfo.badge);
  }

  // Function to handle successful login
  const handleLoginSuccess = async () => {

    if (isConnected) {

      const branchId = ethers.utils.hexlify(ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [officerInfo.branchId])
      ));
      const badge = ethers.utils.formatBytes32String(officerInfo.badge);

      // console.log("branchid ::", branchId)
      // console.log("stateCode ::", officerInfo.stateCode)
      // console.log("badge ::", badge)
      // console.log("rank ::", officerInfo.rank)
      
      const validity = await readContract({
        address: process.env.REACT_APP_LEDGER_CONTRACT,
        abi: LedgerABI,
        functionName: 'isValidEmployment',
        args: [
          branchId, // bytes32 _branchId,
          officerInfo.stateCode, // uint _stateCode
          badge, // bytes32 _badge
          officerInfo.rank //Rank _rank
        ],
        account: address,
        chainId: 11155111
      })
      console.log("validity ::", validity)

      if (validity) {
      // if (validityRank) {
        if (selectedValue === 'Captain') { navigate('/cases-captain'); setGlobalVariables(); }
        else if (selectedValue === 'Detective') { navigate('/cases-detective'); setGlobalVariables(); }
        else if (selectedValue === 'Officer') { navigate('/cases-officer'); setGlobalVariables(); }
        else if (selectedValue === 'Moderator') { navigate('/moderator-home'); setGlobalVariables(); }
        else { handleValidationFail(); }
      } else {
        handleValidationFail();
      }
    };
  }  
  
  const handleLogin = (connector) => {
    if (selectedValue == null) {
      notify("error", "Rank is required");
    } else if (!officerInfo.stateCode) {
      notify("error", "State Code is required");
    } else if (!officerInfo.branchId) {
      notify("error", "Branch Id is required");
    } else if (officerInfo.badge === "") {
      notify("error", "Badge is required");
    } else {
      connect({ connector });
    }
  };

  const handleValidationFail = () => {
    if(isConnected) {
      disconnect()
    }
    notify("error", "Rank validation failed");
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
        {/* rank */}
          <div className="mb-4">
            <Dropdown>
              <Dropdown.Toggle variant="light" id="rank" className="dropdown">
                {/* {selectedValue ? rankMap.get(selectedValue) : "Select Rank"} */}
                {selectedValue ? (selectedValue) : "Select Your Rank"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {Array.from(rankMap).map(([key, value]) => (
                  <Dropdown.Item name="stateCode" key={key} onClick={() => handleDropdownSelect(key)} >
                    {value}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

        {/* state code */}
          <div className="mb-4">
            <Dropdown>
              <Dropdown.Toggle variant="light" id="stateCode" className="dropdown">
                {selectedStateCode ? stateCodeMap.get(selectedStateCode) : "Select State Code"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {Array.from(stateCodeMap).map(([key, value]) => (
                  <Dropdown.Item name="stateCode" key={key} onClick={() => handleStateCodeDropdownSelect(key)} >
                    {value}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

        {/* Branch Id */}
          <div className="mb-4">
            <Dropdown>
              <Dropdown.Toggle variant="light" id="branchId" className="dropdown">
                {selectedBranchId ? branchIdMap.get(selectedBranchId) : "Select Branch Id"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {Array.from(branchIdMap).map(([key, value]) => (
                  <Dropdown.Item name="branchId" key={key} onClick={() => handleBranchIdDropdownSelect(key)} >
                    {value}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

        {/* badge */}
          <div className="input mb-5">
            <input
              type="string"
              name="badge"
              id="badge"
              placeholder="Your Badge Here"
              className="form-control"
              onChange={handleChange}
            ></input>
          </div>

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
    
          {/* {error && <div>{error.message}</div>} */}
        </div>
      </div>
    </div>
  )
}
