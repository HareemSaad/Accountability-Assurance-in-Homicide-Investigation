import React from 'react'
import './Home.css'
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { readContract } from '@wagmi/core'
import { notify } from "./../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import OfficersABI from "./../OfficersABI.json"

export const Login = () => {

  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { address, connector, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  let navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState(null);

  // Function to handle dropdown item selection
  const handleDropdownSelect = async (value) => {
    setSelectedValue(value);
  };

   // Function to handle successful login
  const handleLoginSuccess = async () => {

    if (isConnected) {

      const validity = await readContract({
        address: process.env.REACT_APP_OFFICER_CONTRACT,
        abi: OfficersABI.abi,
        functionName: 'isValidOfficer',
        args: [address],
        chainId: 11155111
      })
      console.log("validity ::", validity)

      if (validity) {
        navigate("/cases");
      } else {
        handleValidationFail();
      }
    };
  }

  const handleLogin = (connector) => {
    if (selectedValue == null) {
      notify("error", "Rank is required");
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
        <DropdownButton id="rank" title={selectedValue ? selectedValue : "Select Your Rank"} className='mb-4'>
          <Dropdown.Item onClick={() => handleDropdownSelect('Captain')}>Captain</Dropdown.Item>
          <Dropdown.Item onClick={() => handleDropdownSelect('Officer')}>Officer</Dropdown.Item>
          <Dropdown.Item onClick={() => handleDropdownSelect('Detective')}>Detective</Dropdown.Item>
        </DropdownButton>
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
