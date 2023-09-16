import React from 'react'
import './Home.css'
import '../../global/GlobalContext.js'
import { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from "react-router-dom";
import { Global } from '../../global/GlobalContext.js';

export const Login = (props) => {

  const [stateGlobal, setGlobal] = useContext(Global);

  let navigate = useNavigate();

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        updateMetamaskConnection(false);
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      let balance = await provider.getBalance(accounts[0]);
      let bal = ethers.utils.formatEther(balance);
      
      // updateConnection(true);

      // let chain = await provider.getNetwork()
      // updateChain(chain.chainId)
      navigate('/cases');
    } catch (error) {
      updateConnection(false);
    }
  };

  const updateConnection = (connection) => {
    console.log("from login updated Connection");
    console.log("Connection: ", connection);
    // const updatedGlobalState = { ...stateGlobal, connected: connection };
    // console.log("Updated global state:", updatedGlobalState);
    // setGlobal(updatedGlobalState);
    setGlobal(prevGlobalState => ({ ...prevGlobalState, connected: connection }));
  }

  const updateMetamaskConnection = (connection) => {
    console.log("from login updated Metamask Connection");
    console.log("Metamask Connection: ", connection);
    setGlobal(prevGlobalState => ({ ...prevGlobalState, metamask: connection }));
  }

  const updateChain = (chain) => {
    console.log("from updated Chain");
    console.log("Chain: ", chain);
    setGlobal(prevGlobalState => ({ ...prevGlobalState, chainId: chain }));
    // console.log(stateGlobal);
  };

  return (
    <div className='login'>
        <div className='login-container'>
            <h2 className='login-welcome'> Welcome </h2>
            <button className='login-button' onClick={connectWallet}> Connect </button>
        </div>
    </div>
  )
}
