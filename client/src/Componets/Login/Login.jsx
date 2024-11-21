import React, { useState } from 'react';
import './Login.css';
import '../../App.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserShield } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";
import { AiOutlineSwapRight } from "react-icons/ai";
import Axios from 'axios';

import video from '../../LoginAssets/video.mp4';
import logo from '../../LoginAssets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imei, setImei] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginPrompt, setLoginPrompt] = useState('');
  const navigate = useNavigate();

  // Handle Login submission
  const handleLogin = (e) => {
    e.preventDefault();

    Axios.post('http://localhost:3002/login', {
      email: email,
      password: password
    })
      .then((response) => {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          navigate('/dashboard');
        } else {
          setErrorMessage(response.data.message);
          setSearchResult(null);
        }
      })
      .catch((error) => {
        setErrorMessage(error.response?.data.message || 'An error occurred. Please try again.');
        setSearchResult(null);
      });
  };

  // Handle IMEI Search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchResult(null);
    setErrorMessage('');

    Axios.get(`http://localhost:3002/api/login-search/${imei}`)
      .then((response) => {
        if (response.data.color) {
          setSearchResult(`Phone Color: ${response.data.color}`);
          setLoginPrompt('');
          setImei('');
        } else {
          setSearchResult(null);
          setErrorMessage('No phone color found for this IMEI');
        }
      })
      .catch((error) => {
        setErrorMessage(error.response?.data.message || 'An error occurred. Please try again.');
        setSearchResult(null);
      });
  };

  return (
    <div className="loginPage flex">
      <div className="container flex">
        <div className='videoDiv'>
          <video src={video} autoPlay muted loop></video>
          <div className="textDiv">
            <h2 className='title'>E-Trac keeping you safe</h2>
            <p>Your safety is our priority</p>
            <form className='searchForm' onSubmit={handleSearch}>
              <div className="inputDiv">
                <div className="input flex">
                  <input
                    type="text"
                    id="imei"
                    placeholder="Enter IMEI number"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn flex">Search</button>
            </form>
            {loginPrompt && <span className='infoMessage'>{loginPrompt}</span>}
          </div>
          <div className="footerDiv flex">
            <span className="text">Don't have an account?</span>
            <Link to={'/register'}>
              <button className='btn'>Sign Up</button>
            </Link>
          </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="Logo" />
            <h3>Welcome Back!</h3>
          </div>

          {(errorMessage || searchResult) && (
            <span className='infoMessage'>
              {searchResult || errorMessage}
            </span>
          )}

          <form className='form grid' onSubmit={handleLogin}>
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
                />
              </div>
            </div>

            <button type="submit" className={`btn flex ${!localStorage.getItem('token') ? 'highlight' : ''}`}>
              <span>Login</span>
              <AiOutlineSwapRight className='icon' />
            </button>
          </form>

          <div className="forgot-password-link">
            <label>Forgot Your Password <Link to="/forgot-password">click here</Link></label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
