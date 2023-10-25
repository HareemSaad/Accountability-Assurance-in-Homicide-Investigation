import './App.css';
import React, { useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Route, Routes} from "react-router-dom";
import { NavbarComponent } from './components/Navbar/Navbar';
import { CaseCard } from './components/CaseCard/CaseCard';
import { Home } from './components/Home/Home.js';
import { AddInfo } from './components/AddCaseDetail/AddInfo';
import AddParticipant from './components/AddCaseDetail/AddParticipant';
import AddEvidence from './components/AddCaseDetail/AddEvidence.js';

import { hexToDec } from 'hex2dec';

import CaseDetails from './components/CaseDetails/CaseDetails';
import { WagmiConfig, createConfig, configureChains, mainnet, sepolia} from 'wagmi'
 
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { ToastContainer } from "react-toastify";

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia],
  [alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_SEPOLIA_KEY }), publicProvider()],
)
 
// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
  ],
  publicClient,
  webSocketPublicClient,
})


function App() {

  const Users = {
    Officer: "Officer",
    Detective: "Detective",
    Captain: "Captain"
  }

  const currentUser = Users.Officer;
  // const currentUser = Users.Detective;
  // const currentUser = Users.Captain;

  return (
    <>
      <ToastContainer />
      <WagmiConfig config={config}> 
        <NavbarComponent />
        <Routes>
          <Route path="/" element={ <Home/> } /> 
          <Route path="/cases" element={ <CaseCard currentUser={currentUser}/> } />
          <Route path="/case-detail/:caseId" element={ <CaseDetails /> } />
          <Route path="/add-evidence/:caseId" element={ <AddEvidence /> } />
          <Route path="/add-participant/:caseId" element={ <AddParticipant /> } />
        </Routes>
      </WagmiConfig>
    </>
  );
}

export default App;