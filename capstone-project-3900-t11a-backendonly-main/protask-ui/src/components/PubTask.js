import React, {useState} from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

function PubTask(props) {
    // Retrieves and displays information about
    // a public task

    const task = props.task;
    if (task.deadline === null) {
        task.deadline = 'None';
    }

    const user = props.user;

    const [buttonDisabled, setButtonDisabled] = useState(false);

    // Sends request for assignment to a task
    const postReq = async () => {
        await fetch('/req-task?token=' + user.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({task: task})
        }).then(response => response.json().then(data => {
            console.log(data);
            if (data.task_id !== '') {
                console.log('task requested');     
                
            }    

        }))    
    }

    // Converts task status to string
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

    const reqTask = () => {
        postReq();
        setButtonDisabled(true);
    }

return (
    <Card className='PubTaskCard' style={{ width: '36rem' }}>
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
                <Card.Text>
                    Skills: 
                        <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper', overflow: 'auto', position: 'relative', maxHeight: 300}}>
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
                <Button onClick={e => {reqTask(); e.preventDefault();}} disabled={buttonDisabled}>Request Assignment</Button>
            </Card.Body>
            <Card.Footer>
                <small className="text-muted">id: {task.id}</small>
            </Card.Footer>
    </Card>
  )
}

export default PubTask