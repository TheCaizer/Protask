import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import PasswordChange from './PasswordChange';
import './styling/myProfile.css';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import CreatedTaskHistory from './CreatedTaskHistory';
import AssignedTaskHistory from './AssignedTaskHistory';
import Avatar from '@mui/material/Avatar';
import Form from 'react-bootstrap/Form';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

function MyProfile() {
    // Main profile page that contains all information
    // a user would need about their own details, 
    // including task history. 


    const currUser = JSON.parse(localStorage.getItem('currUser'));

    const [skill, setSkill] = useState({skill: ''});

    const [uDetails, setUDetails] = useState({});


    // Sends request to get updated user information
    useEffect(() => {
      const interval = setInterval(() => {
        fetch('/get-user?token=' + currUser.token).then(response => 
          response.json().then(data => {
            setUDetails(data.info);
            currUser.skills = uDetails.skills;
            currUser.profilePic = uDetails.profilePic;
            localStorage.setItem('currUser', JSON.stringify(currUser));

          })
        );
        }, 800);
      return () => clearInterval(interval);
      
    }, [uDetails, currUser])   

    // Sends request to add a new skill to the user
    const postSkill = async () => {
      await fetch('/add-skill?token=' + currUser.token, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(skill)
      }).then(response => response.json().then(data => {
          if (response.ok) {
              console.log('added skill');
          }  

      }))    
    }
    
    const skillHandler = e => {
        e.preventDefault();
        setSkill({...skill, skill: e.target.value})
    }


    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Uploads new profile picture
    const uploadHandler = e => {
      e.preventDefault();
      const f = e.target.files[0]; 
      console.log(f); 
    
      if (f !== null) {
          const data = new FormData();
          data.append('file', f);
          data.append('filename', f.name);
          const changePicture = async () => {
            
              await fetch('/change-picture?token=' + currUser.token, {
                method: 'POST',
                body: data,
            }).then(response => response.json().then(data => {
                console.log(data.result);
                if (data.result === -1) {
                    console.log('wrong file type');
                } else {
                  console.log('changed picture');
                  currUser.profilePic = data.result;
                  localStorage.setItem('currUser', JSON.stringify(currUser));
                } 

            }))  
      }  
        changePicture();
      }
    
  }

    return (
    <div className='userProfile'>
        <Tabs 
          defaultActiveKey="info"
          className="taskTabs"
          justify
        >
          <Tab eventKey='info' title='My Info'>
          <div className='userInfo'>
              {Object.keys(uDetails).length !== 0 
                ? <div><h2>{uDetails.firstName} {uDetails.lastName}</h2>
                  <h3>{uDetails.email}</h3>
                
                <Avatar ClassName='profPic' alt='profImg' src={require('../static/profile_pictures/' + uDetails.profilePic)} sx={{ width: 280, height: 280, m: 'auto', mt: 12, mb: 2, position: 'relative' }}/>
                <Form.Group controlId="formFileSm" className="mb-3">
                  <Form.Label className='inputPic'>Upload a profile picture</Form.Label>
                  <Form.Control type="file" size="sm" name='file' accept='image/*' onChange={uploadHandler}/>
                </Form.Group>
                <h4>Skills:</h4>
                <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper', overflow: 'auto', position: 'relative', maxHeight: 150, paddingLeft: 2}}>
                {uDetails.skills.map((s, i) => {
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

                </div>
                : <div><h2>{currUser.firstName} {currUser.lastName}</h2>
                <h3>{currUser.email}</h3>
                
                <Avatar ClassName='profPic' alt='profImg' src={require('../static/profile_pictures/' + currUser.profilePic)} sx={{ width: 280, height: 280, m: 'auto', mt: 12, mb: 2, position: 'relative'  }}/>
                <Form.Group controlId="formFileSm" className="mb-3">
                  <Form.Label className='inputPic'>Upload a profile picture</Form.Label>
                  <Form.Control type="file" size="sm" name='file' accept='.jpg, .png' onChange={e => {console.log(e.target.files[0]); e.preventDefault(); uploadHandler();}}/>
                </Form.Group>
                <h4>Skills:</h4>
                <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper', overflow: 'auto', position: 'relative', maxHeight: 150, paddingLeft: 2}}>
                {currUser.skills.map((s, i) => {
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
                </div>
            } 
          </div>
          <div className='editInfo'>
              <Button className='profBtn1' onClick={handleShow}>
                  Change Password
              </Button>
              
              <Modal show={show} onHide={handleClose} className='pw_change__modal'>
                <Modal.Header closeButton>
                <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PasswordChange user={currUser} />
                </Modal.Body>
              </Modal>

              <input type='text' className='skillAdder' onChange={skillHandler} placeholder='Add New Skills'/>
              <Button className='profBtn2' onClick={e => {e.preventDefault(); postSkill();}}>Add Skill</Button>
          </div>
        </Tab>
        <Tab eventKey='pastAssignedTask' title='Past Assigned Tasks'>
            <AssignedTaskHistory currUser={currUser} />
        </Tab>
        <Tab eventKey='pastCreatedTask' title='Past Created Tasks'>
            <CreatedTaskHistory currUser={currUser} />
        </Tab>
      </Tabs>
    </div>
  )
}

export default MyProfile