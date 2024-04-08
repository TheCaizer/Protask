import React from 'react'
import './styling/main.css';
import './styling/home.css';
import Button from 'react-bootstrap/Button';

function Home() {
    // Component to show homepage for first time users enter the site  


    return (
    <div className='homePage'>          
        <div className='homeBG'>
          <img src={require('../assets/bg-1.png')} alt='lineBg'/>
        </div> 
        <div className='homeText'>
          <h1>Welcome to Protask</h1>
          <Button href='/login' className='redirectBtn'>Sign In</Button>
          <Button href='/register' className='redirectBtn'>Sign Up</Button> 
        </div>

    </div>
  )
}

export default Home