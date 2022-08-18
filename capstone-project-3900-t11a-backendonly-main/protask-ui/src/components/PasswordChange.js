import React, {useState} from 'react';
import Alert from '@mui/material/Alert';

function PasswordChange({user}) {
    // Component for changing password
    
    const [details, setDetails] = useState({old_pw: "", new_pw: ""});
    const [show, setShow] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Sends change to backend
    const submitChange = async () => {
        await fetch('/change-password?token=' + user.token, {
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
            } else {
                console.log('password changed');
                setErrorMsg('Password Changed')
                setSuccess(true);
            }

        })) 
    }
  
    return (
    <form onSubmit={e=> {e.preventDefault(); submitChange();}} >
        <div className="form-inner">
            <div className="form-group">
                <label htmlFor="password">Current Password:</label>
                <input type="password" name="password" id="old_pw" onChange={e => setDetails({...details, old_pw: e.target.value})} value={details.old_pw}/>
            </div>
            <div className="form-group">
                <label htmlFor="password">New Password:</label>
                <input type="password" name="password2" id="new_pw" onChange={e => setDetails({...details, new_pw: e.target.value})} value={details.new_pw}/>
            </div>
            {show 
            ? <Alert variant="outlined" severity="error">
                {errorMsg}
            </Alert>
            : <div />
            }
            {success 
            ? <Alert variant="outlined" severity="success">
                {errorMsg}
            </Alert>
            : <div />
            }
            <input type="submit" value="CHANGE PASSWORD" />
        </div>
    </form>
  )
}

export default PasswordChange