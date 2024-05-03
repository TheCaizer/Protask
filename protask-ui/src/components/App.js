import React from 'react';
import NavBar from './NavBar';
import Main from './Main';
import Notifications from './Notifications';
import MyProfile from './MyProfile';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from './Home';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Logout from './Logout';
import PassRecover from './PassRecover';

function App() {
    // Main app containing all components
    
    return (
        <div className='app'>
            <BrowserRouter>

            <NavBar />
            <div className="siteContainer">
                <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/main" element={<Main />} />
                    <Route path="/myprofile" element={<MyProfile/>} />
                    <Route path='/notifications' element={<Notifications />} />
                    <Route path='/logout' element={<Logout />} />
                    <Route path='/forgot-password' element={<PassRecover />} />
                </Routes>
            </div>
            </BrowserRouter>


        </div>
    )
}

export default App