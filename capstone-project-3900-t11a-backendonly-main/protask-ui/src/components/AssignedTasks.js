import React, { useEffect, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BusyFactor from './BusyFactor';
import AssignedTaskInfo from './AssignedTaskInfo';
import AssignedTaskSearch from './AssignedTaskSearch';
import './styling/taskLists.css';

function AssignedTasks({user}) {
  // Component to retrieve list of all assigned tasks to a user
  // that are not completed and approved
  
  const [tasks, setTasks] = useState([]);
  const [notStarted, setNotStarted] = useState([]);
  const [inProg, setInProg] = useState([]);
  const [complete, setComplete] = useState([]);
  const [blocked, setBlocked] = useState([]);
  
  
  // Retrieve assigned tasks every 600ms
  useEffect(() => {
    const interval = setInterval(() => {

      fetch('/assignedTasks?token=' + user.token).then(response => 
        response.json().then(data => {
          //console.log(data.tasks);
          setTasks(data.tasks);

          setNotStarted(tasks.filter((i) => i.status === 0))
          setInProg(tasks.filter((i) => i.status === 1))
          setComplete(tasks.filter((i) => i.status === 2))
          setBlocked(tasks.filter((i) => i.status === -1))
        })
      );

      }, 600);
    return () => clearInterval(interval);
    
  }, [tasks, user.token])    

  return (
    <div className='taskList'>
      <h2 id="tasks"> Assigned Tasks </h2>
      <BusyFactor user={user}/>
      <AssignedTaskSearch className='assignSearchBar' user={user} />
      {tasks.length === 0 ? <h3>You currently have no assigned tasks.</h3> : <div/>}
      <Tab.Container id="list-group-tabs">
      <Row>
        <Col className='NotStarted'>
          <h3>Not Started</h3>
          <ListGroup style={{overflowY: 'auto'}}>
          {notStarted.map(task => {
            const ref = "#" + task.id;
            return (
              <ListGroup.Item action href={ref} key={task.id} >
                {task.title}
              </ListGroup.Item>
            )
          })}
          </ListGroup>
        </Col>
        <Col className='InProgress'>
        <h3>In Progress</h3>
          <ListGroup style={{overflowY: 'auto'}}>
          {inProg.map(task => {
            const ref = "#" + task.id;
            return (
              <ListGroup.Item action href={ref} key={task.id} >
                {task.title}
              </ListGroup.Item>
            )
          })}
          </ListGroup>
        </Col>
        <Col className='Complete'>
          <h3>Complete</h3>
          <ListGroup style={{overflowY: 'auto'}}>
          {complete.map(task => {
            const ref = "#" + task.id;
            return (
              <ListGroup.Item action href={ref} key={task.id} >
                {task.title}
              </ListGroup.Item>
            )
          })}
          </ListGroup>
        </Col>
        <Col className='Blocked'>
          <h3>Blocked</h3>
          <ListGroup style={{overflowY: 'auto'}}>
          {blocked.map(task => {
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

export default AssignedTasks