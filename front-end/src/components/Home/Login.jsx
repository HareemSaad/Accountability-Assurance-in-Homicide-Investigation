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
import OfficersABI from "./../OfficersABI.json";
import LedgerABI from "./../Ledger.json";
import { stateCodeMap, rankMap } from "../data/data.js";

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
  const [selectedValue, setSelectedValue] = useState(null);
  const [officerInfo, setOfficerInfo] = useState({
    rank: 0,
    branchId: 0,
    stateCode: 0,
    badge: 0,
  });
  
  const RoleBytes = {
    Captain: "0xd1caa20fe64a17576895d331b6b815baf91df37730e70e788978bc77ac7559b4", //3
    Detective: "0x9bcceb74634ac977676ecaf8900febd8cc8358719b06c206b86e9e10f6758bc2", //2
    Officer: "0xbbecb2568601cb27e6ced525237c463da94c4fb7a9b98ac79fd30fd56d8e1b53", //1
  }

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOfficerInfo({ ...officerInfo, [name]: value });
    console.log("params :: ", name);
    console.log("value :: ", value);
  }; 

  const setGlobalVariables = () => {
    setUser(selectedValue);
    setStateCode(stateCodeMap.get(officerInfo.stateCode));
    setUserBranchId(officerInfo.branchId);
    setUserBadge(officerInfo.badge);
  }

   // Function to handle successful login
  const handleLoginSuccess = async () => {

    if (isConnected) {

      const validityRank = await readContract({
        address: process.env.REACT_APP_OFFICER_CONTRACT,
        abi: OfficersABI.abi,
        functionName: 'isValidRank',
        args: [address, RoleBytes[selectedValue]],
        chainId: 11155111
      })
      console.log("validity ::", validityRank)
      
      // const validity = await readContract({
      //   address: process.env.REACT_APP_LEDGER_CONTRACT,
      //   abi: LedgerABI,
      //   functionName: 'isValidEmployment',
      //   args: [
      //     ethers.utils.hexlify(ethers.utils.formatBytes32String(officerInfo.branchId)), // bytes32 _branchId,
      //     officerInfo.stateCode, // uint _stateCode
      //     ethers.utils.hexlify(ethers.utils.formatBytes32String(officerInfo.badge)), // bytes32 _badge
      //     officerInfo.rank, //Rank _rank
      //   ],
      //   chainId: 11155111
      // })
      // console.log("validity ::", validity)

      // if (validity) {
      if (validityRank) {
        if (selectedValue == 'Captain') { navigate('/cases-captain'); setGlobalVariables(); }
        else if (selectedValue == 'Detective') { navigate('/cases-detective'); setGlobalVariables(); }
        else if (selectedValue == 'Officer') { navigate('/cases-officer'); setGlobalVariables(); }
        else if (selectedValue == 'Moderator') { navigate('/moderator-home'); setGlobalVariables(); }
        else { handleValidationFail(); }
      } else {
        handleValidationFail();
      }
    };
  }  
  

  const handleLogin = (connector) => {
    if (selectedValue == null) {
      notify("error", "Rank is required");
    } else if (officerInfo.stateCode == null) {
      notify("error", "State Code is required");
    } else if (officerInfo.branchId === "") {
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
          <div className="input mb-4">
            <input
              type="number"
              name="branchId"
              id="branchId"
              placeholder="Your Branch Id Here"
              className="form-control"
              onChange={handleChange}
            ></input>
          </div>

        {/* badge */}
          <div className="input mb-5">
            <input
              type="number"
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
