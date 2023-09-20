import React from 'react'
import './Home.css'
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useConnect, useAccount } from 'wagmi'

export const Login = (props) => {

  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { address, connector, isConnected } = useAccount()
  let navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState(null);

  // Function to handle dropdown item selection
  const handleDropdownSelect = async (value) => {
    setSelectedValue(value);
  };

   // Function to handle successful login
  const handleLoginSuccess = () => {
    navigate('/cases')
  };

  const handleLogin = (connector) => {
    connect({ connector });
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
