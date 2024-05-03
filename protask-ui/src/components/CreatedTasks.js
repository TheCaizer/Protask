import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import CreatedTaskInfo from './CreatedTaskInfo';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import NewTask from './NewTask';
import CreatedTaskSearch from './CreatedTaskSearch';
import './styling/taskLists.css';

function CreatedTasks({currUser}) {
    // Component to retrieve all tasks created by a user
    // that are not completed and approved


    const [tasks, setTasks] = useState([]);   

    // Retrieve created tasks every 600ms
    useEffect(() => {
        const interval = setInterval(() => {
            fetch('/createdTasks?token=' + currUser.token).then(response => 
                response.json().then(data => {
                  setTasks(data.tasks);
                })
              );
            }, 600);
          return () => clearInterval(interval);
      }, [tasks, currUser.token])


    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <div className='taskList'>
            <h2> Your Created Tasks </h2>
            
            <CreatedTaskSearch user={currUser} />
            {tasks.length === 0 ? <h3>You currently have no created tasks.</h3> : <div/>}

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
                                <CreatedTaskInfo task={task} currUser={currUser} />
                            </Tab.Pane>
                            )
                        })}
                    </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>


            <Button onClick={handleShow}>
                Create New Task
            </Button>

            <Modal show={show} onHide={handleClose} width='100vw'>
                <Modal.Header closeButton>
                <Modal.Title>Create a new task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NewTask creator={currUser} projID={null}/>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default CreatedTasks