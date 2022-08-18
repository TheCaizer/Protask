import React, { useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Tab from 'react-bootstrap/Tab';
import AssignedTaskInfo from './AssignedTaskInfo';
import './styling/searchBar.css';

function AssignedTaskSearch({user}) {
    // Search bar component to search through assigned tasks

    const [result, setResult] = useState([]);


    // Search every time user enters into search bar
    const changeHandler = e => {
        e.preventDefault();
        const query =  e.target.value;

        const searchConnections = async () => {
            await fetch('/assigned-search?token=' + user.token, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({query: query})
            }).then(response => response.json().then(data => {
    
                if (response.ok) {
                    setResult(data.result) 
                    
                    
                    
                }    
    
            })) 
        }
        
        searchConnections();
    }
        
    return (
        
        <div className='search'>
            <div className='searchBar'>
                <input type='text' onChange={changeHandler} placeholder='Search Assigned Tasks'>

                </input>
            </div>
            {result.length !== 0 && (
                <div className='searchResult'>
                    <Tab.Container id="list-group-tabs">
                        <ListGroup>
                            {result.map(t => {
                                const ref = "#" + t.task.id;
                                return (
                                <ListGroup.Item classname="searchData" action href={ref}  key={t.task.id}>
                                    {t.task.title} 
                                </ListGroup.Item>
                                )
                            })}
                        </ListGroup>
                        <Tab.Content>  
                            {result.map(t => {
                                return (
                                <Tab.Pane eventKey={"#" + t.task.id} key={t.task.id}>
                                    <AssignedTaskInfo currUser={user} task={t.task}/>
                                </Tab.Pane>
                                )
                            })}
                        </Tab.Content>
                    </Tab.Container>
                </div>
            )}
        </div>
    )
}

export default AssignedTaskSearch