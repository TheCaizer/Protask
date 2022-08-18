import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/esm/Container';
import './styling/notifications.css';

function Notifications() {
    // Component to show all notifications of the user


    const currUser = JSON.parse(localStorage.getItem('currUser'));

    const [friendReqs, setFriendReqs] = useState([]);
    const [taskNotifs, setTaskNotifs] = useState([]);
    
    // Retrieves all connection requests every 600ms
    useEffect(() => {
        const interval = setInterval(() => {
            fetch('/notifications?token=' + currUser.token).then(response => 
                response.json().then(data => {
                  setFriendReqs(data.notifs);
                })
              );
          }, 600);
        return () => clearInterval(interval);
      }, [friendReqs, currUser.token])

    // Retrieves all other notifications every 700ms
    useEffect(() => {
        const interval = setInterval(() => {
            fetch('/taskNotifications?token=' + currUser.token).then(response => 
                response.json().then(data => {
                    setTaskNotifs(data.notifs);
                })
                );
          }, 700);
        return () => clearInterval(interval);
    }, [taskNotifs, currUser.token])
        
      
    
    return (
        <div className='notifPage'>   
        <Container>
            <Row>
                <Col>
                    <div className='connectionReqs'>
                        <h2> Pending Connection Requests </h2>

                        <ListGroup>
                            {friendReqs.map(conxion => {
                            console.log(conxion);
                            return (
                                <ListGroup.Item key={conxion.email}>
                                    Connection request from {conxion.firstName} {conxion.lastName}, {conxion.email}
                                    <Button as="input" type="button" value="Accept" size="sm" onClick={async () => {
                                        const response = await fetch('/accept-req?token=' + currUser.token, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(conxion)
                                        })

                                        if (response.ok) {
                                            console.log('accepted request');
                                            setFriendReqs(friendReqs.filter((i) => i.email !== conxion.email)); 
                                        }
                                    }}
                                    />

                                    <Button as="input" type="button" value="Reject" size="sm" onClick={async () => {
                                        const response = await fetch('/reject-req?token=' + currUser.token, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(conxion)
                                        })

                                        if (response.ok) {
                                            console.log('rejected request'); 
                                            setFriendReqs(friendReqs.filter((i) => i.email !== conxion.email));
                                        }
                                    }}
                                    />

                                </ListGroup.Item>
                                )
                            })}
                            
                        </ListGroup>

                    </div>
                    </Col>
                    <Col>
                    <div className='taskNotifs'>
                        <h2> Notifications </h2>

                        <ListGroup>
                            {taskNotifs.map(task => {
                            //console.log(task);
                            
                            if (task.notificationType === 0) {
                                // Case for task being assigned to you
                                return (
                                    <ListGroup.Item key={task.notificationID}>
                                    {task.creatorEmail} has assigned you the task {task.title}
                                    <Button as="input" type="button" value="Mark as read" size="sm" onClick={async () => {
                                        const response = await fetch('/mark-notification-read?token=' + currUser.token, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(task)
                                        })
                                        
                                        if (response.ok) {
                                            console.log('marked read');
                                            setTaskNotifs(taskNotifs.filter((i) => i.notificationID !== task.notificationID)); 
                                        }
                                    }}
                                    /> 
                                    </ListGroup.Item>   
                                )
                            } else if (task.notificationType === 1) {
                                // Case for one of your tasks being marked as complete
                                return (
                                    <ListGroup.Item key={task.notificationID}>
                                    An assignee has marked {task.title} as COMPLETE
                                    <Button as="input" type="button" value="Approve" size="sm" onClick={async () => {
                                        const response = await fetch('/approve-complete?token=' + currUser.token, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(task)
                                        })

                                        if (response.ok) {
                                            console.log('approved completion');
                                            setTaskNotifs(taskNotifs.filter((i) => i.notificationID !== task.notificationID)); 
                                        }
                                    }}
                                    />

                                    <Button as="input" type="button" value="Deny" size="sm" onClick={async () => {
                                        const response = await fetch('/deny-complete?token=' + currUser.token, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(task)
                                        })

                                        if (response.ok) {
                                            console.log('denied completion'); 
                                            setTaskNotifs(taskNotifs.filter((i) => i.notificationID !== task.notificationID));
                                        }
                                    }}
                                    />

                                    </ListGroup.Item>
                                )
                            } else if (task.notificationType === 2) {
                                // Case for task being created in one of your projects
                                return (
                                    <ListGroup.Item key={task.notificationID}>
                                    A new task has been created in your project {task.title}
                                    <Button as="input" type="button" value="Mark as read" size="sm" onClick={async () => {
                                        const response = await fetch('/mark-notification-read?token=' + currUser.token, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(task)
                                        })
                                        
                                        if (response.ok) {
                                            console.log('marked read');
                                            setTaskNotifs(taskNotifs.filter((i) => i.notificationID !== task.notificationID)); 
                                        }
                                    }}
                                    /> 
                                    </ListGroup.Item>   
                                )


                            } else if (task.notificationType === 3) {
                                // Case for being added to a project as a member
                                return (
                                    <ListGroup.Item key={task.notificationID}>
                                    {task.creatorEmail} has added you to the project {task.title}
                                    <Button as="input" type="button" value="Mark as read" size="sm" onClick={async () => {
                                        const response = await fetch('/mark-notification-read?token=' + currUser.token, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(task)
                                        })
                                        
                                        if (response.ok) {
                                            console.log('marked read');
                                            setTaskNotifs(taskNotifs.filter((i) => i.notificationID !== task.notificationID)); 
                                        }
                                    }}
                                    /> 
                                    </ListGroup.Item>   
                                )

                            } else if (task.notificationType === 4) {
                                // Case for a task in your project being marked as complete
                                return (
                                    <ListGroup.Item key={task.notificationID}>
                                    A task has been completed in your project {task.title}
                                    <Button as="input" type="button" value="Mark as read" size="sm" onClick={async () => {
                                        const response = await fetch('/mark-notification-read?token=' + currUser.token, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(task)
                                        })
                                        
                                        if (response.ok) {
                                            console.log('marked read');
                                            setTaskNotifs(taskNotifs.filter((i) => i.notificationID !== task.notificationID)); 
                                        }
                                    }}
                                    /> 
                                    </ListGroup.Item>   
                                )

                            } else if (task.notificationType === 5) {
                                // Case for having overdue tasks
                                return (
                                    <ListGroup.Item key={task.notificationID}>
                                        You have overdue tasks
                                    </ListGroup.Item>   
                                )

                            }
                            })}
                            
                        </ListGroup>

                    </div>
                </Col>
            </Row>
            </Container>
        
        </div> 
    )
}

export default Notifications