import React, { useEffect, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AssignedTaskInfo from './AssignedTaskInfo';

function ConnectionTasks(props) {
  // Component to show all the tasks of a user's connection 
  
  const [tasks, setTasks] = useState([]);

  const user = props.user;
  const conxion = props.conxion;  
  
  
  // Retrieve tasks of connections
  useEffect(() => {
    fetch('/connectionTasks?token=' + user.token + '&email=' + conxion.email).then(response => 
      response.json().then(data => {
        console.log(data.tasks);
        setTasks(data.tasks);
      })
    );
  }, [user.token, conxion.email])    

  return (
    <div style={{marginTop: '3em'}}>
      <h4 id="ConnectionTasks"> Assigned Tasks for {conxion.firstName} {conxion.lastName} </h4>
      
      
      <Tab.Container id="list-group-tabs connectionTasks">
      <Row>
        <Col sm={10}>
          <ListGroup>
          {tasks.map(task => {
            const ref = "#" + task.id;
            return (
              <ListGroup.Item action href={ref} key={task.id} >
                {task.title}
              </ListGroup.Item>
            )
          })}
          </ListGroup>
        </Col>
        <Col sm={8}>
          <Tab.Content>  
            {tasks.map(task => {
                return (
                  <Tab.Pane eventKey={"#" + task.id} key={task.id.toString()}>
                    <AssignedTaskInfo task={task} currUser={user} />
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

export default ConnectionTasks