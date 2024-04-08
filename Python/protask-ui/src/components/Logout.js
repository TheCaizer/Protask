import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

function Logout() {
    // Component for users to logout
    
    const currUser = JSON.parse(localStorage.getItem('currUser'));
    localStorage.clear();

    const navigate = useNavigate();
    const home = () =>{ 
        navigate('/');
    }

    // Logs user off and returns them to home page
    useEffect(() => {
        fetch('/logout?token=' + currUser.token).then(response => 
            response.json().then(data => {
                console.log("logged off");
                home();
            })
        ); }, [currUser.token])

            

    return (
    <div>
      <h2>Logging out...</h2>
    </div>
  )
}

export default Logout