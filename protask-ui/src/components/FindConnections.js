import React from 'react';
import Row from 'react-bootstrap/Row';
import AllPosts from './AllPosts';
import ConnectionRecs from './ConnectionRecs';
import './styling/findCon.css';

function FindConnections({user}) {
    // Component container for finding connections 
    // through recommendations or public posts

    return (
    <div className="findCon">
        <Row>
            <ConnectionRecs user={user} />
        </Row>
        <Row>
            <AllPosts user={user} />

        </Row>
    
    </div>
  )
}

export default FindConnections