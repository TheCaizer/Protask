import React from 'react';
import Connections from './Connections';
import AssignedTasks from './AssignedTasks';
import CreatedTasks from './CreatedTasks';
import ProjectList from './ProjectList';
import PublicTasks from './PublicTasks';
import FindConnections from './FindConnections';
import MyPosts from './MyPosts';
import PastDue from './PastDue';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import './styling/main.css';

function Main() {
    // Main page for majority of content that user will require about tasks,
    // connections and projects

    const currUser = JSON.parse(localStorage.getItem('currUser'));
    

    return (
    <div className='mainPage'>   
        <Container className='mainContent'>
            <Row>   
                <Col xs={3} className='friendCol'>   
                    <Tabs
                        defaultActiveKey="friends"
                        className="nav-tabs"
                        justify
                        fill
                    >
                    <Tab eventKey='friends' title={<span> <GroupIcon color='primary'/> My Connections </span>}>      
                        <div className='friends'>
                            <Connections className='friendList' user={currUser}/>
                        </div>
                    </Tab> 
                    <Tab eventKey='findFriends' title={<span> <GroupAddIcon color='primary'/> Find New Connections </span>}>      
                        <div className='findFriends'>
                            <FindConnections className='friendList' user={currUser}/>
                        </div>
                    </Tab>
                    </Tabs>

                </Col> 
                <Col xs={9} className='taskCol'>   
                    <Tabs
                        defaultActiveKey="assignedTasks"
                        className="nav-tabs"
                        fill
                        justify
                    >
                    <Tab eventKey="assignedTasks" title={<span> Assigned Tasks <CheckBoxOutlineBlankIcon color='primary'/> </span>}>
                        <div className='assignedTasks'>
                            <AssignedTasks className='assTaskList' user={currUser} />
                        </div>
                    </Tab>
                    <Tab eventKey="createdTasks" title={<span> Created Tasks <CheckBoxIcon color='primary'/> </span>}>
                        <div className='myCreatedTasks'>
                            <CreatedTasks currUser={currUser} />
                        </div>
                    </Tab>
                    <Tab eventKey="overdueTasks" title={<span> Overdue Tasks <ReportIcon color='primary'/> </span>}>
                        <div className='myProj'>
                            <PastDue user={currUser} />
                        </div>
                    </Tab>
                    <Tab eventKey="publicTasks" title={<span> Public Tasks <AssignmentTurnedInIcon color='primary'/> </span>}>
                        <div className='pubTasks'>
                            <PublicTasks user={currUser} />
                        </div>
                    </Tab>
                    <Tab eventKey='myPosts' title={<span> Created Posts <AssignmentIndIcon color='primary'/> </span>}>      
                        <div className='myPosts'>
                            <MyPosts currUser={currUser}/>
                        </div>
                    </Tab>
                    <Tab eventKey="projects" title={<span> Projects <LibraryAddCheckIcon color='primary'/> </span>}>
                        <div className='proj'>
                            <ProjectList user={currUser} />
                        </div>
                    </Tab>
                    
                    </Tabs>
                </Col>
            </Row> 
        </Container>
 
    </div>
  )
}

export default Main