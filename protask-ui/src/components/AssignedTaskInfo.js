import React, {useState, useEffect} from 'react';
import Card from 'react-bootstrap/Card';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

function AssignedTaskInfo(props) {
    // Component to see the specific information
    // of an assigned task
    
    const[status, setStatus] = useState({});
    const[isAssignee, setIsAssignee] = useState(false);

    const task = props.task;

    if (task.deadline === null) {
        task.deadline = 'None';
    }

    const currUser = props.currUser;
    const projectMgr = props.projMan;

    // Allows assignees to change status only
    useEffect(() => {
        if (task.assignees.includes(currUser.email)) {
            //console.log(true);
            setIsAssignee(true);
        } else if (projectMgr !== undefined) {
            
            if (projectMgr.includes(currUser.email)) {
                //console.log(true);
                setIsAssignee(true);    
            }
            
        }
        console.log(task);
    }, [currUser.email, projectMgr, task]);
    
    // Send status change
    const postChange = async () => {
        await fetch('/change-status?token=' + currUser.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(status)
        }).then(response => 
            response.json().then(data => {
                console.log(data);
            })
        )}
    
    // Convert status numbers to string
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



    const handleSelect=(e)=>{
        status.taskID = task.id;
        const val = parseInt(e, 10); 
        status.newStatus = val;
        if (task.projectID !== null) {
            console.log(task.projectID)
            status.projectID = task.projectID;
        } else {
            status.projectID = null;
        }
        //console.log(status);
        postChange();
      }
    
    return (
        <Card className='AssignedTaskCard' style={{width: '20rem' }}>
            <Card.Header>
                <Card.Title>{task.title}</Card.Title>
                <Card.Subtitle className="mb-3 text-muted">Creator: {task.creatorEmail} </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">Deadline: {task.deadline} </Card.Subtitle>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    {task.description}
                </Card.Text>
                <Card.Text>
                    Status: {stringify_stat()}
                </Card.Text>
                { isAssignee
                    ? <DropdownButton onSelect={handleSelect} id="status-dropdown" title="Change Status">
                        <Dropdown.Item eventKey='1'>In Progress</Dropdown.Item>
                        <Dropdown.Item eventKey='2'>Complete</Dropdown.Item>
                        <Dropdown.Item eventKey='-1'>Blocked</Dropdown.Item>
                    </DropdownButton> : <div />
                }
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
        
  )
}

export default AssignedTaskInfo