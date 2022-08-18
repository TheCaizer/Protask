import React, {useState} from 'react';
import './styling/main.css';
import './styling/authForms.css';

function AddConnection({user}) {
    // Component to send a connection
    // request to a user
    
    const [details, setDetails] = useState({email: ""});

    const sendReq = async () => {
        const response = await fetch('/add-connection?token=' + user.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        })
    
        if (response.ok) {
            console.log('request sent'); 
        }
      }

    return (
    <form onSubmit={e => {e.preventDefault(); sendReq();}}>
        <div className="form-inner">
            {/* Error */}
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" name="email" id="email" onChange={e => setDetails({...details, email: e.target.value})} value={details.email}/>
            </div>
            <input type="submit" value="SEND CONNECTION REQUEST" />
        </div>
    </form>
    
  )
}

export default AddConnection