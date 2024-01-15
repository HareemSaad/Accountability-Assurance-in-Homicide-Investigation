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
// Create - Moderator requests
import { ModeratorHome } from './components/ModeratorHome/ModeratorHome.js';
import { CreateRequest } from './components/CreateRequest/CreateRequest.js';
import { CreateBranch } from './components/CreateRequest/CreateBranch.js';
import { OfficerOnboard } from './components/CreateRequest/OfficerOnboard.js';
import { OfficerOffboard } from './components/CreateRequest/OfficerOffboard.js';
import { TransferOfficerBranch } from './components/CreateRequest/TransferOfficerBranch.js';
import { TrusteeRequest } from './components/CreateRequest/TrusteeRequest.js';
import { UpdateBranch } from './components/CreateRequest/UpdateBranch.js';
import { UpdateOfficer } from './components/CreateRequest/UpdateOfficer.js';
import { TransferCaptain } from './components/CreateRequest/TransferCaptain.js';
import { TransferCase } from './components/CreateRequest/TransferCase.js';
// View - Moderator requests
import { ViewRequests } from './components/ViewRequest/ViewRequests.js';
import { ViewCreateBranch } from './components/ViewRequest/ViewCreateBranch.js';
import { ViewOfficerOnboard } from './components/ViewRequest/ViewOfficerOnboard.js';
import { ViewOfficerOffboard } from './components/ViewRequest/ViewOfficerOffboard.js';
import { ViewTransferOfficerBranch } from './components/ViewRequest/ViewTransferOfficerBranch.js';
import { ViewTrusteeRequest } from './components/ViewRequest/ViewTrusteeRequest.js';
import { ViewUpdateBranch } from './components/ViewRequest/ViewUpdateBranch.js';
import { ViewUpdateOfficer } from './components/ViewRequest/ViewUpdateOfficer.js';
import { ViewTransferCaptain } from './components/ViewRequest/ViewTransferCaptain.js';
import { ViewTransferCase } from './components/ViewRequest/ViewTransferCase.js';

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
import { UserAddressContextProvider } from './components/Context/userAddressContext.tsx';
import { UserBadgeProvider } from './components/Context/userBadgeContext.tsx';
import { UserBranchIdProvider } from './components/Context/userBranchIdContext.tsx';
import { StateCodeProvider } from './components/Context/stateCodeContext.tsx';

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
    <UserAddressContextProvider>
      <StateCodeProvider>
      <UserBadgeProvider>
      <UserBranchIdProvider>
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
            {/* Moderator-only create request */}
            <Route path="/moderator-home" element={<ModeratorHome />} />
            <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/create-request/create-branch" element={<CreateBranch />} />
            <Route path="/create-request/officer-onboard" element={<OfficerOnboard />} />
            <Route path="/create-request/officer-offboard" element={<OfficerOffboard />} />
            <Route path="/create-request/transfer-officer-branch" element={<TransferOfficerBranch />} />
            <Route path="/create-request/trustee-request" element={<TrusteeRequest />} />
            <Route path="/create-request/update-branch" element={<UpdateBranch />} />
            <Route path="/create-request/update-officer" element={<UpdateOfficer />} />
            <Route path="/create-request/transfer-captain" element={<TransferCaptain />} />
            <Route path="/create-request/transfer-case" element={<TransferCase />} />
            {/* Moderator-only view requests */}
            <Route path="/:reqName" element={<ViewRequests />} />
            <Route path="/view-create-branch/:reqId" element={<ViewCreateBranch />} />
            <Route path="/view-officer-onboard/:reqId" element={<ViewOfficerOnboard />} />
            <Route path="/view-officer-offboard/:reqId" element={<ViewOfficerOffboard />} />
            <Route path="/view-transfer-officer-branch/:reqId" element={<ViewTransferOfficerBranch />} />
            <Route path="/view-trustee-request/:reqId" element={<ViewTrusteeRequest />} />
            <Route path="/view-update-branch/:reqId" element={<ViewUpdateBranch />} />
            <Route path="/view-update-officer/:reqId" element={<ViewUpdateOfficer />} />
            <Route path="/view-transfer-captain/:reqId" element={<ViewTransferCaptain />} />
            <Route path="/view-transfer-case/:reqId" element={<ViewTransferCase />} />
          </Routes>
        </WagmiConfig>

      </UserProvider>
      </UserBranchIdProvider>
      </UserBadgeProvider>
      </StateCodeProvider>
    </UserAddressContextProvider>
    </>
  );
}

export default App;