import React from 'react';
import Card from 'react-bootstrap/Card';
import BusyFactor from './BusyFactor';
import ConnectionTasks from './ConnectionTasks';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

function Profile(props) {
    // Component to show profile information of any
    // user that is not the current active user
    
    const currUser = props.user;
    const user = props.conxion;
    //console.log(user);

    return(
        <Card className='userProfile' style={{ width: '20rem' }}>
            <Tabs
                defaultActiveKey="userInfo"
                className="userTabs"
                fill
                justify
            >
            <Tab eventKey="userInfo" title="Profile">
                <Card.Header>
                    <Card.Title className='userProfile-title'>{user.firstName} {user.lastName}</Card.Title>
                    <Card.Subtitle className='userProfile-subtitle'>{user.email}</Card.Subtitle>
                    <Avatar alt={'profImg'+user.email} src={require('../static/profile_pictures/' + user.profilePic)} sx={{ width: 124, height: 124 }}/>
                </Card.Header>
                <Card.Body>
                    Skills: 
                        <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper', overflow: 'auto', position: 'relative', maxHeight: 300}}>
                        {user.skills.map((s, i) => {
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
                </Card.Body>
            </Tab>
            <Tab eventKey="currTasks" title="Current Tasks">
                <div className='user-currTasks'>
                    <BusyFactor user={user}/>
                    <ConnectionTasks user={currUser} conxion={user} style={{marginTop: '100px'}}/> 
                </div>
            </Tab>
            </Tabs>
        </Card>
    )
}

export default Profile