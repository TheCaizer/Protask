import React, {useState, useEffect} from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import {Link} from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';


function NavBar() {
    // Main navbar component to navigate the site, 
    // is dynamic based on whether a user is signed in or not. 
  
    const [currUser, setCurrUser] = useState({});
    const [numNotif, setNumNotif] = useState(0);
  

    // Retrieves the number of notifications a user currently has
    useEffect(() => {
      if (Object.keys(currUser).length !== 0) {
        const interval = setInterval(() => {
          fetch('/numNotifs?token=' + currUser.token).then(response => 
            response.json().then(data => {
              setNumNotif(data.num);
              //console.log(data);
  
            })
          );
          }, 600);
        return () => clearInterval(interval);
      }
    }, [numNotif, currUser])
    
    // Retrieves updated information about the current user
    useEffect(() => {
      const interval = setInterval(() => {
        const u = JSON.parse(localStorage.getItem('currUser'));
        if (u) {
            setCurrUser(u);
            //console.log(u);
        }
      }, 500);
      return () => clearInterval(interval);

    }, [currUser])

  
    return (
        <Navbar bg="dark" variant='dark' expand="lg" style={{height: '3em'}}>
          {Object.keys(currUser).length === 0
          ? <Container>
              <Navbar.Brand href="/">Protask</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/register"> <AppRegistrationIcon color='warning'/> Sign Up </Nav.Link>
                  <Nav.Link as={Link} to="/login"> <LoginIcon color='warning'/> Sign In </Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Container>      
          :  <Container>
              <Navbar.Brand as={Link} to="/main">Protask</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/main"><HomeIcon color="warning" /> Home</Nav.Link>
                  <Nav.Link as={Link} to="/myprofile"> <PersonIcon color="warning" /> Profile</Nav.Link>
                </Nav>
              <Navbar.Collapse className="justify-content-end">
                  <Nav>
              
                      <Nav.Link as={Link} to="/notifications"> 
                        Notifications
                        <Badge badgeContent={numNotif} color="primary">
                          <NotificationsIcon color="warning" />
                        </Badge>
                        
                      </Nav.Link>
                      <Nav.Link as={Link} to="/logout">Logout <LogoutIcon color="warning" /> </Nav.Link>
                  </Nav>
              </Navbar.Collapse>
                  
              </Navbar.Collapse>
            </Container>
          }
        </Navbar>
      );
}

export default NavBar