import React, { useState } from 'react';
import './Register.css';
import '../../App.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaUserShield } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";
import { AiOutlineSwapRight } from "react-icons/ai";
import Axios from 'axios';

import video from '../../LoginAssets/video.mp4';
import logo from '../../LoginAssets/logo.png';

const Register = () => {
  const navigate = useNavigate(); // Initialize useNavigate for redirection
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Disable form after submission

  const handleRegister = (e) => {
    e.preventDefault();
    
    console.log('Registering with:', { username, email, password }); // Log input data

    setIsSubmitting(true); // Disable form during submission
    setErrorMessage('');
    setSuccessMessage('');

    Axios.post('http://localhost:3002/register', {
      username: username,
      email: email,
      password: password
    })    
    .then((response) => {
      if (response.data.success) {
        setSuccessMessage('Registration successful!'); // Removed email confirmation message
        setIsSubmitting(false); // Re-enable form
        
        // Reset form fields
        setUsername('');
        setEmail('');
        setPassword('');

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/'); // Change the route to your login page
        }, 3000);
      } else {
        setErrorMessage(response.data.message);
        setIsSubmitting(false);
      }
    })
    .catch((error) => {
      console.error('Error registering:', error);
      if (error.response) {
        setErrorMessage(error.response.data.message || 'An error occurred. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
      setIsSubmitting(false);
    });
  };

  return (
    <div className="registerPage flex">
      <div className="container flex">
        <div className='videoDiv'>
          <video src={video} autoPlay muted loop></video>
          <div className="textDiv">
            <h2 className='title'>Join E-Trac Today</h2>
            <p>Register to stay safe with us</p>
          </div>
          <div className="footerDiv flex">
            <span className="text">Already have an account?</span>
            <Link to='/'>
              <button className='btn'>Login</button>
            </Link>
          </div>
        </div>
        
        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="Logo" />
            <h3>Get Started!</h3>
          </div>

          <form className='form grid' onSubmit={handleRegister}>
            {errorMessage && <span className='errorMessage'>{errorMessage}</span>}
            {successMessage && <span className='successMessage'>{successMessage}</span>}

            <div className="inputDiv">
              <label htmlFor="username">Username</label>
              <div className="input flex">
                <FaUser className='icon' />
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="email">Email</label>
              <div className="input flex">
                <FaUserShield className='icon' />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="password">Password</label>
              <div className="input flex">
                <BsFillShieldLockFill className='icon' />
                <input
                  type="password"
                  id="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button type="submit" className="btn flex" disabled={isSubmitting}>
              <span>Register</span>
              <AiOutlineSwapRight className='icon' />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
