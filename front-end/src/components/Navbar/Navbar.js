import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import { Global } from './../../global/GlobalContext';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

export const NavbarComponent = () => {

  const [stateGlobal, setGlobal] = useContext(Global);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (stateGlobal.address == null || stateGlobal.address.length == 0) {
      setMessage("Connect to Account");
    } else {
      setMessage(stateGlobal.address);
    }
  }, [stateGlobal.address]);


  return (
    <Navbar className="nav">
      <Container>
        <img className='navLogo' src="/logo.png" alt="Logo" width="50" height="50" />
        <Navbar.Brand className='text-light' href='/cases'>Police Department</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className='text-light navAccount'>
            {message}
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
