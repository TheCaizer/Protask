import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './styling/main.css';
import './styling/authForms.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PasswordStrengthBar from 'react-password-strength-bar';
import Alert from '@mui/material/Alert';
import ListGroup from 'react-bootstrap/ListGroup';


function RegisterForm() {
    // Component for a user to register their details
    
    const [details, setDetails] = useState({firstName: "", lastName: "", email: "", password: "", password2: "", skills: []});
    const [show, setShow] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [skillName, setSkillName] = useState('');

    
    const navigate = useNavigate(); 
    
    const signIn = () =>{ 
        navigate('/main');
    }

    // Sends details to backend
    const postForm = async () => {
        await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        }).then(response => response.json().then(data => {
            if (data.hasOwnProperty('error')) {
                console.log(data);
                setErrorMsg(data.error);
                setShow(true);
            } else if (data.token !== '') {
                localStorage.setItem('currUser', JSON.stringify(data));
                console.log('registered'); 
                signIn();    
            } 

               

        })) 
    }

    // Adds a skill to user's details
    const addSkill = (skill) => {
        if (!details.skills.includes(skill)) {
            details.skills.push(skill);
        }
    }

    const submitHandler = e => {
        e.preventDefault();
        postForm();
    }

    return (
        <div className='regContainer'>
            <div className='errorBox' style={{zIndex: '3'}}>
                {show 
                    ? <Alert variant="filled" severity="error">
                        {errorMsg}
                    </Alert>
                  : <div />
                }
            </div>
            <div className='regBox'>
                <Form onSubmit={submitHandler} className='authForm'>                 

                    <h2>Register</h2>
                    <Row>
                        <Col>
                            <Form.Label>First Name</Form.Label>
                            <Form.Control type="text" name="firstName" id="firstName" onChange={e => setDetails({...details, firstName: e.target.value})} value={details.firstName}/>
                        </Col>
                        <Col>
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control type="text" name="lastName" id="lastName" onChange={e => setDetails({...details, lastName: e.target.value})} value={details.lastName}/>
                        </Col>
                    </Row>
                    
                    <Form.Group className="authForm__inner" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" name="email" id="email" onChange={e => setDetails({...details, email: e.target.value})} value={details.email}/>
                    </Form.Group>

                    <Form.Group className="authForm__inner" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" id="password" onChange={e => setDetails({...details, password: e.target.value})} value={details.password}/>
                        <PasswordStrengthBar password={details.password} minLength='8' shortScoreWord=''/>
                        <p style={{color: '#d2d8da'}}> 
                            Password must be minimum 8 characters, and contain at least 1 uppercase letter,
                            lowercase letter and number
                        </p>
                    </Form.Group>

                    <Form.Group className="authForm__inner" controlId="password2">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" name="password2" id="password2" onChange={e => setDetails({...details, password2: e.target.value})} value={details.password2}/>
                    </Form.Group>

                    <Form.Group className="authForm__inner" controlId="skills">
                        <Form.Label>Skills</Form.Label>
                        <Form.Control type="skills" name="skills" id="skills" onChange={e => setSkillName(e.target.value)} value={skillName}/>
                        <p style={{color: '#d2d8da'}}> 
                            Add each skill separately using the 'add skill' button
                        </p>
                        <Button type='button' onClick={e => {addSkill(skillName); e.preventDefault();}} value={details.skills}>Add Skill</Button>
                        <ListGroup>
                            {details.skills.map((skill, i) => {
                                return (
                                    <ListGroup.Item key={i}>
                                        {skill}
                                    </ListGroup.Item>
                                )
                            })}    
                        </ListGroup>
                    </Form.Group>

                    <Button type="submit" className="authForm__button">
                        REGISTER
                    </Button>
                </Form>
            </div>
        </div>
    )
}

export default RegisterForm;