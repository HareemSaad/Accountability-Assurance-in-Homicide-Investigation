import './App.css';
import React, { useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Route, Routes } from "react-router-dom";
import { NavbarComponent } from './components/Navbar/Navbar';
import { CaseCard_Detective } from './components/CaseCard/CaseCard_Detective';
import { CaseCard_Captain } from './components/CaseCard/CaseCard_Captain';
import { AddCase } from './components/AddCase/AddCase';
import { AddOfficer } from './components/AddOfficer/AddOfficer';
import { AddOfficerInCase } from './components/AddDropOfficer/AddOfficerInCase';
import { DropOfficerFromCase } from './components/AddDropOfficer/DropOfficerFromCase';
import { ChangeCaseStatus } from './components/CaseStatus/ChangeCaseStatus.js';
import { ArchiveCases } from './components/ArchiveCases/ArchiveCases.js';
import { EmployeeCard } from './components/EmployeeCard/EmployeeCard.js';
import { ArchiveEmployees } from './components/ArchiveEmployees/ArchiveEmployees.js';
import { EmployeeDetails } from './components/EmployeeDetails/EmployeeDetails.js';
import { EmployeeStatus } from './components/EmployeeStatus/EmployeeStatus.js';
// Requests - Moderator
import { ModeratorHome } from './components/ModeratorHome/ModeratorHome.js';
import { CreateRequest } from './components/CreateRequest/CreateRequest.js';
import { CreateBranch } from './components/CreateRequest/CreateBranch.js';
import { OfficerOnboard } from './components/CreateRequest/OfficerOnboard.js';


import { Home } from './components/Home/Home.js';
import { AddInfo } from './components/AddCaseDetail/AddInfo';
import AddParticipant from './components/AddCaseDetail/AddParticipant';
import AddEvidence from './components/AddCaseDetail/AddEvidence.js';

import { hexToDec } from 'hex2dec';

import CaseDetails from './components/CaseDetails/CaseDetails';
import { WagmiConfig, createConfig, configureChains, mainnet, sepolia } from 'wagmi'

import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { ToastContainer } from "react-toastify";

// CONTEXT
import { UserContext, UserProvider } from './components/Context/userContext.tsx';

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

  // const Users = {
  //   Officer: "Officer",
  //   Detective: "Detective",
  //   Captain: "Captain"
  // }

  // const currentUser = Users.Officer;
  // const currentUser = Users.Detective;
  // const currentUser = Users.Captain;

  return (
    <>
      <UserProvider>
        <ToastContainer />
        <WagmiConfig config={config}>
          <NavbarComponent />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cases-detective" element={<CaseCard_Detective />} />
            <Route path="/cases-captain" element={<CaseCard_Captain />} />
            <Route path="/case-detail/:caseId" element={<CaseDetails />} />
            <Route path="/add-evidence/:caseId" element={<AddEvidence />} />
            <Route path="/add-participant/:caseId" element={<AddParticipant />} />
            {/* Captain-only accessed */}
            <Route path="/add-case" element={<AddCase />} />
            <Route path="/add-officer" element={<AddOfficer />} />
            <Route path="/add-officer-in-case/:caseId" element={<AddOfficerInCase />} />
            <Route path="/drop-officer-from-case/:caseId" element={<DropOfficerFromCase />} />
            <Route path="/change-case-status/:caseId" element={<ChangeCaseStatus />} />
            <Route path="/archive-cases" element={<ArchiveCases />} />
            <Route path="/employees" element={<EmployeeCard />} />
            <Route path="/archive-employees" element={<ArchiveEmployees />} />
            <Route path="/employee-detail/:employeeId" element={<EmployeeDetails />} />
            <Route path="/change-employee-status/:employeeId" element={<EmployeeStatus />} />
            {/* Moderator-only accessed */}
            <Route path="/moderator-home" element={<ModeratorHome />} />
            <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/create-request/create-branch" element={<CreateBranch />} />
            <Route path="/create-request/officer-onboard" element={<OfficerOnboard />} />
          </Routes>
        </WagmiConfig>
      </UserProvider>
    </>
  );
}

export default App;