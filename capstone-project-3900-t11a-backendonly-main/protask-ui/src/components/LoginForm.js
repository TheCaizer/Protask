import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './styling/main.css';
import './styling/authForms.css';
import Alert from '@mui/material/Alert';

function LoginForm() {
    // Component for users to login
    
    const [details, setDetails] = useState({email: "", password: ""});
    const [show, setShow] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');


    let navigate = useNavigate(); 

    const signIn = () =>{ 
        navigate('/main');
    }

    // Posts form to backend upon submission
    const postForm = async () => {
        await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        }).then(response => response.json().then(data => {

            console.log(data);

            if (data.hasOwnProperty('error')) {
                console.log(data);
                setErrorMsg(data.error);
                setShow(true);
            }
            else if (data.token !== '') {
                console.log('logging in');
                localStorage.setItem('currUser', JSON.stringify(data)); 
                signIn();
                
                
                
            }    

        }))
    }

    const submitHandler = e => {
        e.preventDefault();
        postForm();
        
    }


    return (
        <div className='loginContainer'>
            <div className='errorBox'>
                {show 
                    ? <Alert variant="outlined" severity="error">
                        {errorMsg}
                    </Alert>
                  : <div />
                }
            </div>
            <div className='loginBox'>
                <Form onSubmit={submitHandler} className='authForm'>
                    <h2>Login</h2>
                    <Form.Group className="authForm__inner" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" name="email" id="email" onChange={e => setDetails({...details, email: e.target.value})} value={details.email}/>
                    </Form.Group>

                    <Form.Group className="authForm__inner" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" id="password" onChange={e => setDetails({...details, password: e.target.value})} value={details.password}/>
                    </Form.Group>
                    <Button type="submit" className="authForm__button">
                        LOGIN
                    </Button>

                    <div classname="forgotPw">
                        <Link to="/forgot-password" >Forgot Password?</Link>
                    </div>
                    
                </Form>
            </div>
        </div>
    )
}

export default LoginForm;