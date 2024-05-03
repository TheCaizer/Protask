import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import NewTask from './NewTask';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AssignedTaskInfo from './AssignedTaskInfo';
import PublicTasks from './PublicTasks';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';


function ProjectInfo(props) {
    // Component to retrieve all the information about a project

    
    const [details, setDetails] = useState({email: ''});
    const [show, setShow] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [target, setTarget] = useState('');
    const [managerString, setManagerString] = useState('');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const project = props.project;
    const user = props.user;

    const manToStr = () => {
        let str = ' ';
        project.creatorEmail.map((e, i) => {
            str += e + ' ';
        })
        setManagerString(str);
    }

    // Allows creator to access specific permissions
    useEffect(() => {
        manToStr();
        if (project.creatorEmail.includes(user.email)) {
            setIsCreator(true);
        }
    }, [project.creatorEmail, user.email]);


    // Add new member to project
    const addMember = async () => {
        await fetch('/project-addNewMember?token=' + user.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        }).then(response => response.json().then(data => {
            
            if (data.success === 1) {
                console.log('member added');     
            } else {
                console.log('not added');
            }    

        })) 
    }

    // Promote a member to a project manager
    const promoteMem = async () => {
        await fetch('/project-promoteMember?token=' + user.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: target, projectID: project.id})
        }).then(response => response.json().then(data => {
            
            if (data.success === 1) {
                console.log('member promoted');   
                manToStr();  
            } else {
                console.log('not promoted');
            }    

        }))     
    }

    // Send request to delete project
    const delProject = async () => {
        await fetch('/delete-project?token=' + user.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        }).then(response => response.json().then(data => {
            if (data.result === 1) {
                console.log('deleted project');
            }  

        })) 
    }

    const delHandler = e => {
        e.preventDefault();
        delProject();
    }

    const addAssignee = (email) => {
        if (!project.listofMembers.includes(email)) {    
            details.email = email;
            details.projectID = project.id; 
            addMember(email);       
        }
        setDetails({})
    }

    const changeHandler = e => {
        e.preventDefault();
        const query = e.target.value;
        const searchProject = async () => {
            await fetch('/project-search?token=' + user.token, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({query: query, projectID: project.id})
            }).then(response => response.json().then(data => {
    
                if (response.ok) {
                    setResult(data.result); 
                        
                    
                }    
    
            })) 
        }
        searchProject();
    }

    const [result, setResult] = useState([]);

    const promote = (email) => {
        setTarget(email);
        promoteMem();    
    }

    return(
      <Card style={{ width: '48rem' }} className='projectInfoCard'>
          <Card.Header>
              <Card.Title>{project.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Manager List: {managerString}</Card.Subtitle>
          </Card.Header>
          <Card.Body>
            <div className='addMemBox' style={{zIndex: '3'}}>
                {isCreator 
                    ? <div className='connectionSearch'>
                        <div className='connectionSearchBar'>
                            <input type='text' onChange={changeHandler} placeholder='Add Members'/>
                        </div>
                        {result.length !== 0 && (    
                            <div className='projectSearchResult'>
                                <ListGroup>
                                    {result.map((conxion, i) => {
                                        return (
                                        <ListGroup.Item action onClick={e => {addAssignee(conxion.email); e.preventDefault();}} key={conxion.email}>
                                            {conxion.email} | {conxion.firstName} {conxion.lastName} 
                                        </ListGroup.Item>
                                        )
                                    })}
                                </ListGroup>
                            </div>
                        )}
                    </div>
                  : <div />
                }
            </div>
              Project Members:
              <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', overflow: 'auto', position: 'relative', maxHeight: 300}}>
                {project.listofMembers.map((m, i) => {
                    return (
                    <ListItem
                        key={i}
                        disablePadding
                    >

                        <ListItemText primary={m} />
                        {isCreator 
                            ? <Button onClick={e => {promote(m); e.preventDefault();}}>Promote to Manager</Button>
                            : <div/>

                        }
                    </ListItem>
                    );
                })}
                </List>
              <Tabs
                        defaultActiveKey="projTasks"
                        className="projTaskTabs"
                        fill
                        justify
                    >
                <Tab eventKey="projTasks" title="Project Assigned Tasks">
                    Project Tasks:
                    {project.projectTasks.length === 0 ? <h3 style={{color: 'black'}}>There are currently no assigned tasks for you in this project.</h3> : <div/>}
                    <Tab.Container id="list-group-tabs">
                        <Row>
                            <Col sm={12}>
                            <ListGroup>
                            {project.projectTasks.map(task => {
                                const ref = "#" + task.id;
                                return (
                                <ListGroup.Item action href={ref} key={task.id} >
                                    {task.title}
                                </ListGroup.Item>
                                )
                            })}
                            </ListGroup>
                            </Col>
                            <Col sm={12}>
                            <Tab.Content>  
                                {project.projectTasks.map(task => {
                                    return (
                                    <Tab.Pane eventKey={"#" + task.id} key={task.id.toString()}>
                                        <AssignedTaskInfo task={task} currUser={user} projMan={project.creatorEmail}/>
                                    </Tab.Pane>
                                    )
                                })}
                            </Tab.Content>
                            </Col>
                        </Row>
                        </Tab.Container>
                </Tab>
                <Tab eventKey="projPubTasks" title="Project Public Tasks">
                    Public Tasks:
                    <PublicTasks user={user} projectID={project.id}/>
                </Tab>
                </Tabs>

          </Card.Body>
          <Card.Footer>
  
            <Button onClick={handleShow}>
                Add New Task to Project
            </Button>

            <Modal show={show} onHide={handleClose} width='100vw'>
                <Modal.Header closeButton>
                <Modal.Title>New Project Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NewTask creator={user} projID={project.id}/>
                </Modal.Body>
            </Modal>

            {isCreator
                ? <Button variant='danger' onClick={delHandler}>DELETE PROJECT</Button>
                : <div />
            }
            
            ID: {project.id}
            
          </Card.Footer>
      </Card>
      
)
}

export default ProjectInfo