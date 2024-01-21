import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import { Navigate, useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';

import Navbar from 'react-bootstrap/Navbar';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from 'wagmi'

export const NavbarComponent = () => {

  const { disconnect } = useDisconnect()
  const { address, connector, isConnected } = useAccount()
  let navigate = useNavigate();

  useEffect(() => {
    if(!isConnected) {
      navigate("/")
    }
  }, [isConnected]);

  const logoNavigation = () => {
    const userRank = localStorage.getItem("rank")?.toLowerCase();

    if (userRank === 'captain') {
      navigate('/cases-captain');
    } else if (userRank === 'detective') {
      navigate('/cases-detective');
    } else if (userRank === 'officer') {
      navigate('/cases-officer');
    } else if (userRank === 'moderator') {
      navigate('/moderator-home');
    }
  }
  
  return (
    <Navbar className="nav">
      {console.log("rank", localStorage.getItem("rank")?.toLowerCase())}
      <Container>
        <img className='navLogo' src="/logo.png" alt="Logo" width="50" height="50" />
        <Navbar.Brand className='text-light' onClick={logoNavigation} style={{ cursor: 'pointer' }}>Police Department</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className='text-light navAccount'>
            {isConnected ? address : "0x00"}
          </Navbar.Text>
        </Navbar.Collapse>
        <button className='logout-button' onClick={disconnect}>Disconnect</button>
      </Container>
    </Navbar>
  )
}
