import React, { useEffect, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import './styling/findCon.css';

function AllPosts({user}) {
  // Component to retrieve all public posts that
  // are from non-connected users to the current
  // user
  
  const [posts, setPosts] = useState([]);
  const [target, setTarget] = useState('');
  
  // Retrieve posts every 600ms
  useEffect(() => {
    const interval = setInterval(() => {

      fetch('/allPosts?token=' + user.token).then(response => 
        response.json().then(data => {
          //console.log(data.tasks);
          setPosts(data.posts);
          console.log(data.posts);
        })
      );
      }, 600);
    return () => clearInterval(interval);
    
  }, [posts, user.token])    

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
    <div className='findCon'>
      <h2> All Posts </h2>
      
      <Tab.Container id="list-group-tabs">
      <Row>
        <Col>
          <ListGroup style={{overflowY: 'auto'}}>
          {posts.map(p => {
            return (
              <ListGroup.Item action key={p.postID} >
                <h3>{p.creatorEmail}</h3>
                <h4>{p.description}</h4>
                <List dense sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper', overflow: 'auto', position: 'relative', maxHeight: 300}}>
                  <ListSubheader>Skills: </ListSubheader>
                  {p.skills.map((s, i) => {
                  return (
                      <ListItem
                          key={i}
                          disablePadding
                      >
                          <ListItemText primary={s} />
                      </ListItem>
                      );
                  })}
                </List>
                <Button onClick={e => {clickHandler(p.creatorEmail); e.preventDefault(); }}>Add Connection</Button>
              </ListGroup.Item>
            )
          })}
          </ListGroup>
        </Col>
      </Row>
    </Tab.Container>
    
    </div>

    
  )
}

export default AllPosts