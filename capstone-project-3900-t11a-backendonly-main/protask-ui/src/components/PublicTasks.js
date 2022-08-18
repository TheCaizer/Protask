import React, {useEffect, useState} from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import PubTask from './PubTask';
import './styling/taskLists.css';

function PublicTasks(props) {
    // Retrieves all tasks from a user's connections
    // that have been posted as public
    
    const user = props.user;
    const projectID = props.projectID;

    const [pubTask, setPubTask] = useState([]);

    // Retrieve public tasks every 800ms
    useEffect(() => {
        const interval = setInterval(() => {
        fetch('/publicTasks?token=' + user.token + '&projectID=' + projectID).then(response => 
            response.json().then(data => {
                setPubTask(data.tasks);
                //console.log(data.tasks)
            })
        );
        }, 800);
        return () => clearInterval(interval);
        }, [pubTask, user.token, projectID]) 


    return (
    <div className='taskList'>
        {projectID === undefined ? <h2 id="tasks">Public Tasks</h2> : <div/>}
        {(pubTask.length === 0 && projectID === undefined) ? <h3>There are no available public tasks.</h3> : <div/>}
        {(pubTask.length === 0 && projectID !== undefined) ? <h3 style={{color: 'black'}}>There are no available public tasks in this project.</h3> : <div/>}
        
        <ListGroup>
            {pubTask.map(t => {
              return (
                <ListGroup.Item key={t.id} >
                    <PubTask user={user} task={t}/>
                </ListGroup.Item>
              )
            })}
        </ListGroup>
        
        
        
        
    </div>
  )
}

export default PublicTasks