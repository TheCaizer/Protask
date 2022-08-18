import React, { useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Tab from 'react-bootstrap/Tab';
import Profile from './Profile';
import './styling/searchBar.css';

function ConnectionSearch({user}) {
    // Search bar component to search through a user's connections
    
    const [result, setResult] = useState([]);

    // Search connections everytime user enters into search bar
    const changeHandler = e => {
        e.preventDefault();
        const query = e.target.value;
        console.log(query);
        

        const searchConnections = async () => {
            await fetch('/search-connections?token=' + user.token, {
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
        
        <div className='connectionSearch'>
            <div className='connectionSearchBar'>
                <input type='text' onChange={changeHandler} placeholder='Search Connections'>

                </input>
            </div>
            {result.length !== 0 && (
                <div className='connectionSearchResult'>
                    <Tab.Container id="list-group-tabs">
                        <ListGroup>
                            {result.map(conxion => {
                                const ref = "#" + conxion.email;
                                return (
                                <ListGroup.Item classname="connectionSearchData" action href={ref}  key={conxion.email}>
                                    {conxion.email} | {conxion.firstName} {conxion.lastName} 
                                </ListGroup.Item>
                                )
                            })}
                        </ListGroup>
                        <Tab.Content>  
                            {result.map(conxion => {
                                return (
                                <Tab.Pane eventKey={"#" + conxion.email} key={conxion.email}>
                                    <Profile conxion={conxion} user={user} />
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

export default ConnectionSearch