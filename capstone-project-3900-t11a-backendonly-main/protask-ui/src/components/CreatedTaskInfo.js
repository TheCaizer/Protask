import React, {useState} from 'react';
import Card from 'react-bootstrap/Card';
import EditTask from './EditTask';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

function CreatedTaskInfo(props) {
    // Component to show all the information of a 
    // task created by a user
    
    const task = props.task;
    const currUser = props.currUser;

    if (task.deadline === null) {
        task.deadline = 'None';
    }
    
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Turn status number to string
    const stringify_stat = () => {
        if (task.status === 0) {
            return "Not Started";
        } else if (task.status === 1) {
            return "In Progress"
        } else if (task.status === 2) {
            return "Complete"
        } else if (task.status === -1) {
            return "Blocked"
        }
    }
    
    return (
        
        <Card className='createdTaskCard' style={{ width: '32rem' }}>
            <Card.Header>
                <Card.Title>{task.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Deadline: {task.deadline} </Card.Subtitle>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    {task.description}
                </Card.Text>
                <Card.Text>
                    Status: {stringify_stat()}
                </Card.Text>
                <Card.Text className='createdTask_assgn'>
                    Assignees: 
                    <ListGroup>
                        {task.assignees.map((m, i) => {
                            return (
                                <ListGroup.Item key={i}>
                                    {m}
                                </ListGroup.Item>
                            )
                        })}
                    </ListGroup>
                </Card.Text>
                <Card.Text className='createdTask_skills'>
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

            <Button onClick={handleShow}>
                Edit Task
            </Button>

            <Modal show={show} onHide={handleClose} width='100vw'>
                <Modal.Header closeButton>
                <Modal.Title>Edit Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <EditTask task={task} currUser={currUser} />
                </Modal.Body>
            </Modal>

        </Card>
        
  )
}

export default CreatedTaskInfo