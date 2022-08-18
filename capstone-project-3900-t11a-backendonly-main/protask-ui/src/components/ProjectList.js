import React, {useEffect, useState} from 'react';
import ProjectInfo from './ProjectInfo';
import Tab from 'react-bootstrap/Tab';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import NewProject from './NewProject';
import './styling/taskLists.css';



function ProjectList({user}) {
    // Retrieves all projects that the user is currently
    // participating in  

  
    const [projects, setProjects] = useState([]);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Retrieve projects every 700ms
    useEffect(() => {
      const interval = setInterval(() => {
        fetch('/projects?token=' + user.token).then(response => 
          response.json().then(data => {
            //console.log(data.connections);
            setProjects(data.projects);
          })
        );
        }, 700);
      return () => clearInterval(interval);
      }, [projects, user.token]) 
  
    return (
        <div className="taskList">
        <h2> Projects </h2>
        {projects.length === 0 ? <h3>You are currently not in any projects</h3> : <div/>}
        
        <Tab.Container id="list-group-tabs">
        <Row>
          <Col>
            <ListGroup style={{overflowY: 'auto'}}>
            {projects.map(proj => {
              const ref = "#" + proj.id;
              return (
                <ListGroup.Item action href={ref} key={proj.id} >
                  {proj.title}
                </ListGroup.Item>
              )
            })}
            </ListGroup>
          </Col>
          <Col>
            <Tab.Content>  
              {projects.map(proj => {
                  return (
                    <Tab.Pane eventKey={"#" + proj.id} key={proj.id}>
                      <ProjectInfo project={proj} user={user}/>
                    </Tab.Pane>
                  )
                })}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
      
        <Button onClick={handleShow}>
          Create New Project
        </Button>
  
        <Modal show={show} onHide={handleClose} width='100vw'>
            <Modal.Header closeButton>
            <Modal.Title>Create a New Project</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <NewProject creator={user} />
            </Modal.Body>
        </Modal>
      
      </div>
  )
}

export default ProjectList