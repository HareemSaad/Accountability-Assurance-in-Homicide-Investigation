import React, { useContext } from 'react'
import './Home.css'
import { useState, useEffect, } from 'react';
import { useNavigate } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { readContract } from '@wagmi/core'
import { notify } from "./../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import OfficersABI from "./../OfficersABI.json";

// CONTEXT
import { UserContext, useUserContext } from '../Context/userContext.tsx';

export const Login = () => {
  const { user, setUser } = useUserContext();

  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { address, connector, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  let navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState(null);
  const RoleBytes = {
    Captain: "0xd1caa20fe64a17576895d331b6b815baf91df37730e70e788978bc77ac7559b4",
    Detective: "0x9bcceb74634ac977676ecaf8900febd8cc8358719b06c206b86e9e10f6758bc2",
    Officer: "0xbbecb2568601cb27e6ced525237c463da94c4fb7a9b98ac79fd30fd56d8e1b53",
  }

  // Function to handle dropdown item selection
  const handleDropdownSelect = async (value) => {
    setSelectedValue(value);
    console.log("value :: ", value)
    setUser(value);
  };

  // Function to handle successful login
  const handleLoginSuccess = async () => {

    if (isConnected) {

      const validity = await readContract({
        address: process.env.REACT_APP_OFFICER_CONTRACT,
        abi: OfficersABI.abi,
        functionName: 'isValidRank',
        args: [address, RoleBytes[selectedValue]],
        chainId: 11155111
      })
      console.log("validity ::", validity)

      if (validity) {
        if (selectedValue == 'Captain') { navigate('/cases-captain') }
        else if (selectedValue == 'Detective') { navigate('/cases-detective') }
        else if (selectedValue == 'Officer') { navigate('/cases-officer') }
        else { handleValidationFail(); }
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
    if (isConnected) {
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
        <h2 className='login-welcome'> Welcome {user}</h2>
        <DropdownButton variant="light" id="rank" title={selectedValue ? selectedValue : "Select Your Rank"} className='mb-4 dropdown-rank'>
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
