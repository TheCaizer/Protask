import React, { useEffect, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Profile from './Profile'
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import AddConnection from './AddConnection';
import ConnectionSearch from './ConnectionSearch';
import './styling/connections.css';
import Avatar from '@mui/material/Avatar';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function Connections({user}) {
  // Components to show all the connections of a user
  
  const [connections, setConnections] = useState([]);
  

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Retrieve connections every 800ms
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/connections?token=' + user.token).then(response => 
        response.json().then(data => {
          //console.log(data.connections);
          setConnections(data.connections);
          console.log(connections);
        })
      );
      }, 800);
    return () => clearInterval(interval);
    
  }, [connections, user.token])    

  return (
    <div className="connections">
      <h2> Connections </h2>
      
      <ConnectionSearch user={user} />

      <Button className='addBtn'onClick={handleShow}>
        Add Connection <PersonAddIcon color='secondary'/>
      </Button>

      <Modal show={show} onHide={handleClose} width='100vw'>
          <Modal.Header closeButton>
          <Modal.Title>Add a New Connection</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <AddConnection user={user} />
          </Modal.Body>
      </Modal>
      

      <Tab.Container id="list-group-tabs">
      <Row>
        <Col>
          <ListGroup style={{overflowY: 'auto'}}>
            {connections.map(conxion => {
              const ref = "#" + conxion.email;
              return (
                <ListGroup.Item action href={ref} key={conxion.email} >
                  {conxion.firstName} {conxion.lastName} <Avatar alt={'profImg'+conxion.email} src={require('../static/profile_pictures/' + conxion.profilePic)} sx={{ width: 28, height: 28 }}/>
                </ListGroup.Item>
              )
            })}
            </ListGroup>
        </Col>
        <Col sm={8}>
          <Tab.Content>  
            {connections.map(conxion => {
                return (
                  <Tab.Pane eventKey={"#" + conxion.email} key={conxion.email}>
                    <Profile conxion={conxion} user={user} />
                  </Tab.Pane>
                )
              })}
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
    
    
    </div>

    
  )
}

export default Connections