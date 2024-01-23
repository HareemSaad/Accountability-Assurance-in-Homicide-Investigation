import React from 'react'
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

  let navigate = useNavigate();
  
  const setGlobalVariables = (rank, stateCode, branchId, badge) => {
    localStorage.setItem("rank", rankMap.get(rank));
    localStorage.setItem("rankId", rank);
    localStorage.setItem("statecode", stateCode);
    localStorage.setItem("branchid", branchId);
    localStorage.setItem("badge", badge);
  }

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
          if (userDetails.rank  === 3) { navigate('/cases-captain'); setGlobalVariables(userDetails.rank, userDetails.stateCode, userDetails.branchId, userDetails.badge); }
          else if (userDetails.rank  === 2) { navigate('/cases-detective'); setGlobalVariables(userDetails.rank, userDetails.stateCode, userDetails.branchId, userDetails.badge); }
          else if (userDetails.rank  === 1) { navigate('/cases-officer'); setGlobalVariables(userDetails.rank, userDetails.stateCode, userDetails.branchId, userDetails.badge); }
          else if (userDetails.rank  === 4) { navigate('/moderator-home'); setGlobalVariables(userDetails.rank, userDetails.stateCode, userDetails.branchId, userDetails.badge); }
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
  
  const handleLogin = (connector) => {
    connect({ connector });
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
