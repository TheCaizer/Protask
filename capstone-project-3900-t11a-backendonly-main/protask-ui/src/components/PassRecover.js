import React, {useState} from 'react';

function PassRecover() {
    // Component for forgotten password
    
    const [details, setDetails] = useState({email: ""});
    
    return (
    <form onSubmit={async () => {
        const response = await fetch('/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        })

        if (response.ok) {
            console.log('email sent'); 
        }
    }} >
        <div className="form-inner">
            <h2>Password Recovery</h2>
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" name="email" id="email" onChange={e => setDetails({...details, email: e.target.value})} value={details.email}/>
            </div>
            <input type="submit" value="SEND RECOVERY EMAIL" />
        </div>
    </form>
    
  )
}

export default PassRecover