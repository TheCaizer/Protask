import React, { useEffect, useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import './styling/findCon.css';

function ConnectionRecs({user}) {
  // Component to show all recommended connections to a user
  // based on mutual connections
  
  const [connections, setConnections] = useState([]);
  const [target, setTarget] = useState('');
  
  // Retrieve recommendations every 800ms
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/connectionRecs?token=' + user.token).then(response => 
        response.json().then(data => {
          //console.log(data.connections);
          setConnections(data.recs);
        })
      );
      }, 800);
    return () => clearInterval(interval);
    
  }, [connections, user.token])  
  
  // Send friend request to a recommendation
  const sendReq = async () => {
    const response = await fetch('/add-connection?token=' + user.token, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: target})
    })

    if (response.ok) {
        console.log('request sent'); 
    }
  }

  const clickHandler = (email) => {
    setTarget(email);
    sendReq();
  }

  return (
    <div className="findCon">
      <h2> Recommended Connections </h2>      
      
      <Row>
        <Col>
          <ListGroup style={{overflowY: 'auto'}}>
          {connections.map(conxion => {
            return (
              <ListGroup.Item key={conxion.email} >
                {conxion.firstName} {conxion.lastName} | {conxion.email}
                Mutual Connections: {conxion.mutuals}
                <Button onClick={e => {clickHandler(conxion.email); e.preventDefault(); }}>Add Connection</Button>
              </ListGroup.Item>
            )
          })}
          </ListGroup>
        </Col>
      </Row>
    </div>

    
  )
}

export default ConnectionRecs