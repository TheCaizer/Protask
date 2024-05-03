import React, { useEffect, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AssignedTaskInfo from './AssignedTaskInfo';
import './styling/taskLists.css';

function PastDue({user}) {
  // Component to retrieve all tasks that are past 
  // their due date
  
  const [tasks, setTasks] = useState([]);


  // Retrieves tasks past due date every 3000ms
  useEffect(() => {
    const interval = setInterval(() => {

      fetch('/pastDue?token=' + user.token).then(response => 
        response.json().then(data => {
          //console.log(data.tasks);
          setTasks(data.tasks);
        })
      );

      }, 3000);
    return () => clearInterval(interval);    
  }, [tasks, user.token])    



  return (
    <div className='taskList'>
      <h2 id="tasks"> Overdue Tasks </h2>
      {tasks.length === 0 ? <h3>You have no overdue tasks.</h3> : <div/>}
      
      <Tab.Container id="list-group-tabs">
      <Row>
        <Col>
          <ListGroup style={{overflowY: 'auto'}}>
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
        <Col>
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

export default PastDue