import './App.css';
import React, { useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Global } from'./global/GlobalContext';
import { Route, Routes} from "react-router-dom";
import { NavbarComponent } from './components/Navbar/Navbar';
import { CaseCard } from './components/CaseCard/CaseCard';
import { Home } from './components/Home/Home.js';
import { AddInfo } from './components/AddCaseDetail/AddInfo';
import AddParticipant from './components/AddCaseDetail/AddParticipant';
import AddEvidence from './components/AddCaseDetail/AddEvidence.js';

import { hexToDec } from 'hex2dec';

import CaseDetails from './components/CaseDetails/CaseDetails';


function App() {

  const global = useContext(Global);
  const [stateGlobal, setGlobal] = useState(global)

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accountsChanged);
      window.ethereum.on("chainChanged", chainChanged);
      // window.ethereum.on("disconnect", updateConnection);
      // window.ethereum.on("connect", updateConnection);
    }
  }, []);

  useEffect(() => {
    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        updateMetamaskConnection(false);
      }
      updateMetamaskConnection(true);
    };
    checkMetamaskAvailability();
  }, []);

  useEffect(() => {
    console.log("from app.js useEffect");
    console.log("context dddress: ", stateGlobal.address);
  }, [stateGlobal.address]);

  const accountsChanged = async (newAccount) => {
    console.log(111);
    updateAccount(newAccount);
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [newAccount.toString(), "latest"],
      });
      // setAccountBalance(ethers.utils.formatEther(balance));
    } catch (err) {
      console.error(err);
      // setErrorMessage("There was a problem connecting to MetaMask");
    }
  };

  const chainChanged = (chain) => {
    // console.log("CHAIN CHANGED", chain);
    try {
      chain = hexToDec(chain);
      console.log("CHAIN CHANGED", chain);
      updateChain(chain)
    } catch (error) {
      console.log(error);
      updateChain(0)
    }
  };

  const updateAccount = async (accountAddress) => {
    try {
      console.log("from updated account");
      console.log("Connected Account: ", accountAddress);
      if (accountAddress.length == 0) {
        updateConnection(false);
        updateMetamaskConnection(false);
        updateChain(0);
      } else {
        let chain = await provider.getNetwork()
        updateConnection(true);
        updateMetamaskConnection(true);
        updateChain(chain.chainId);
      }
      // const updatedGlobalState = { ...stateGlobal, address: accountAddress };
      // console.log("Updated global state:", updatedGlobalState);
      // setGlobal(updatedGlobalState);
      setGlobal(prevGlobalState => ({ ...prevGlobalState, address: accountAddress }));
    } catch (error) {
      console.log(error);
      updateConnection(false);
    }
  };

  const updateConnection = (connection) => {
    console.log(connection);
    console.log("from updated Connection");
    console.log("Connection: ", connection);
    // const updatedGlobalState = { ...stateGlobal, connected: connection };
    // console.log("Updated global state:", updatedGlobalState);
    // setGlobal(updatedGlobalState);
    setGlobal(prevGlobalState => ({ ...prevGlobalState, connected: connection }));
    console.log(stateGlobal);
  }
  
  const updateMetamaskConnection = (connection) => {
    console.log("from updated Metamask Connection");
    console.log("Metamask Connection: ", connection);
    setGlobal(prevGlobalState => ({ ...prevGlobalState, metamask: connection }));
    // console.log(stateGlobal);
  }
  
  const updateChain = (chain) => {
    console.log("from updated Chain");
    console.log("Chain: ", chain);
    setGlobal(prevGlobalState => ({ ...prevGlobalState, chainId: chain }));
    // console.log(stateGlobal);
  };

  return (
    <div>
      <Global.Provider value={[stateGlobal, setGlobal]}> 
        <NavbarComponent />
        <Routes>
          <Route path="/" element={ <Home/> } /> 
          <Route path="/cases" element={ <CaseCard /> } />
          <Route path="/case-detail" element={ <CaseDetails /> } />
          <Route path="/add-evidence" element={ <AddEvidence /> } />
          <Route path="/add-participant" element={ <AddParticipant /> } />
        </Routes>
      </Global.Provider>
    </div>
  );
}

export default App;