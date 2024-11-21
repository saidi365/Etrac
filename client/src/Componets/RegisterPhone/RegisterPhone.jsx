import React, { useState } from 'react';
import './RegisterPhone.css';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../LoginAssets/logo.png';

const RegisterPhone = () => {
  const [imeiList, setImeiList] = useState(['']);
  const [phoneColor, setPhoneColor] = useState('');
  const [storage, setStorage] = useState('');
  const [date, setDate] = useState('');
  const [gadgetName, setGadgetName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nrc, setNrc] = useState(''); // New NRC state
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = token ? JSON.parse(atob(token.split('.')[1])).username : '';

  const handleRegisterPhone = (e) => {
    e.preventDefault();
    const phoneData = {
      imeis: imeiList.filter(imei => imei),
      color: phoneColor,
      storage,
      date,
      gadgetName,
      phoneNumber,
      nrc,
    };

    Axios.post('http://localhost:3002/api/phones/register', phoneData, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then((response) => {
      if (response.data.success) {
        setMessage('Phone(s) registered successfully!');
        clearForm();
      } else {
        setMessage('registered Successfully.');
        clearForm();
      }
    })
    .catch((error) => {
      if (error.response) {
        // Handle specific error responses
        setMessage(error.response.data.message || 'IMEI already registered.');
      } else {
        setMessage('Error occurred while registering phone.');
      }
    });
  };

  const clearForm = () => {
    setImeiList(['']);
    setPhoneColor('');
    setStorage('');
    setDate('');
    setGadgetName('');
    setPhoneNumber('');
    setNrc(''); // Clear NRC
  };

  const addImeiField = () => {
    setImeiList([...imeiList, '']);
  };

  const handleImeiChange = (index, value) => {
    const newImeiList = [...imeiList];
    newImeiList[index] = value;
    setImeiList(newImeiList);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="registrationPage">
      <div className="navbar">
        <div className="logo-container">
          <img src={logo} alt="ETrac Logo" className="logo" />
          <h1>ETrac Zambia</h1>
        </div>
        
        <div className="navButtons">
          <button onClick={() => navigate('/dashboard')} className="navButton">Home</button>
          <button onClick={() => navigate('/register-phone')} className="navButton">Register Phone</button>
          <button onClick={() => navigate('/about')} className="navButton">About</button>
          <button onClick={handleLogout} className="logoutButton">Logout</button>
        </div>

        <button className="dropdownToggle" onClick={toggleDropdown}>
          ☰
        </button>
        
        {isDropdownOpen && (
          <div className="dropdownMenu">
            <button onClick={closeDropdown} className="closeButton">✖</button>
            <button onClick={() => navigate('/dashboard')} className="dropdownItem">Home</button>
            <button onClick={() => navigate('/register-phone')} className="dropdownItem">Register Phone</button>
            <button onClick={() => navigate('/about')} className="dropdownItem">About</button>
            <button onClick={handleLogout} className="dropdownItem">Logout</button>
          </div>
        )}
      </div>

      {!isDropdownOpen && (
        <div className="registrationForm">
          <h2>Register Phone</h2>
          <form onSubmit={handleRegisterPhone}>
            <input
              type="text"
              placeholder="Owner Name"
              value={username}
              readOnly
            />
            {imeiList.map((imei, index) => (
              <input
                key={index}
                type="text"
                placeholder={`IMEI ${index + 1}`}
                value={imei}
                onChange={(e) => handleImeiChange(index, e.target.value)}
                required
              />
            ))}
            <button type="button" onClick={addImeiField}>Add another IMEI</button>
            <input
              type="text"
              placeholder="Color"
              value={phoneColor}
              onChange={(e) => setPhoneColor(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Storage"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              required
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Gadget Name"
              value={gadgetName}
              onChange={(e) => setGadgetName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="NRC" // NRC input field
              value={nrc}
              onChange={(e) => setNrc(e.target.value)}
              required
            />
            <button type="submit">Register Phone</button>
          </form>
        </div>
      )}

      {message && <h2>{message}</h2>} {/* Show message only if it exists */}

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} ETrac Zambia. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RegisterPhone;
