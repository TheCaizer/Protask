import React, {useEffect, useState} from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import './styling/taskLists.css';


function AssignedTaskHistory({currUser}) {
    // Component to retrieve all past assigned tasks
    // of a user
  
    const [pastTask, setPastTask] = useState([]);

    // Retrieve past assigned tasks every 1000ms
    useEffect(() => {
        const interval = setInterval(() => {
          fetch('/pastAssignedTasks?token=' + currUser.token).then(response => 
            response.json().then(data => {
              console.log(data.tasks);
              setPastTask(data.tasks);
            })
          );
          }, 1000);
        return () => clearInterval(interval);
        
      }, [pastTask, currUser.token])  
  
  
  
    return (
    <div className='taskList'>
        <h2>Assigned Task History</h2>
        <Row>
            <Col>
                <ListGroup>
                {pastTask.map(task => {
                return (
                    <ListGroup.Item key={task.id} >
                      <Card className='AssignedTaskCard' style={{width: '50vw' }}>
                        <Card.Header>
                            <Card.Title>{task.title}</Card.Title>
                            <Card.Subtitle className="mb-3 text-muted">Creator: {task.creatorEmail} </Card.Subtitle>
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {task.description}
                            </Card.Text>
                            <Card.Text>
                                Skills: 
                                <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper', overflow: 'auto', position: 'relative', maxHeight: 240}}>
                                {task.skills.map((s, i) => {
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

                            </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <small className="text-muted">id: {task.id}</small>
                        </Card.Footer>
                    </Card>  
                    
                    
                    <p className='text-muted'>ID: {task.id}</p>
                    {task.title}
                    {task.description}
                    </ListGroup.Item>
                )
                })}
                </ListGroup>
            </Col>   
        </Row> 
    </div>
  )
}

export default AssignedTaskHistory
