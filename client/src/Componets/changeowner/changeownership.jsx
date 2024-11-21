import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import './changeownership.css';
import logo from '../../LoginAssets/logo.png';

const LoadingSpinner = () => <div className="spinner"></div>;

const ChangeOwnership = () => {
    const { phoneId } = useParams();
    const [newOwnerName, setNewOwnerName] = useState('');
    const [newOwnerEmail, setNewOwnerEmail] = useState('');
    const [newOwnerNRC, setNewOwnerNRC] = useState('');
    const [newOwnerPhoneNumber, setNewOwnerPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleEmailVerification = async () => {
        setLoading(true);
        setMessage('');

        try {
            const emailCheckResponse = await Axios.post(
                'http://localhost:3002/api/users/check-email',
                { email: newOwnerEmail },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (emailCheckResponse.data.success) {
                setEmailVerified(true);
            } else {
                setMessage('New owner is not registered. Please register them first.');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeOwnership = async () => {
        setLoading(true);
        setMessage('');

        try {
            const response = await Axios.put('http://localhost:3002/api/phones/change-ownership', {
                phoneId,
                newOwnerName,
                newOwnerEmail,
                newOwnerNRC,
                newOwnerPhoneNumber
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const closeDropdown = () => setIsDropdownOpen(false);
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="changeOwnershipPage">
            <div className="navbar">
                <div className="logo-container">
                    <img src={logo} alt="ETrac Logo" className="logo" />
                    <h1>ETrac Zambia</h1>
                </div>

                <div className="navButtons">
                    <button onClick={() => navigate('/Dashboard')} className="navButton">Home</button>
                    <button onClick={() => navigate('/register-phone')} className="navButton">Register Phone</button>
                    <button onClick={() => navigate('/about')} className="navButton">About</button>
                    <button onClick={handleLogout} className="logoutButton">Logout</button>
                </div>

                <button className="dropdownToggle" onClick={toggleDropdown}>☰</button>

                {isDropdownOpen && (
                    <div className="dropdownMenu">
                        <button onClick={closeDropdown} className="closeButton">✖</button>
                        <button onClick={() => navigate('/Dashboard')} className="dropdownItem">Home</button>
                        <button onClick={() => navigate('/register-phone')} className="dropdownItem">Register Phone</button>
                        <button onClick={() => navigate('/about')} className="dropdownItem">About</button>
                        <button onClick={handleLogout} className="dropdownItem">Logout</button>
                    </div>
                )}
            </div>

            <div className="changeOwnershipForm">
                <h2>Change Ownership</h2>

                {!emailVerified ? (
                    <div className="input-button-container">
                        <input
                            type="email"
                            placeholder="New Owner's Email"
                            value={newOwnerEmail}
                            onChange={(e) => setNewOwnerEmail(e.target.value)}
                        />
                        <button onClick={handleEmailVerification} disabled={loading}>
                            {loading ? <LoadingSpinner /> : 'Verify Email'}
                        </button>
                        <p>{message}</p>
                    </div>
                ) : (
                    <div className="input-button-container">
                        <input
                            type="text"
                            placeholder="New Owner's Name"
                            value={newOwnerName}
                            onChange={(e) => setNewOwnerName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="New Owner's NRC"
                            value={newOwnerNRC}
                            onChange={(e) => setNewOwnerNRC(e.target.value)}
                        />
                        <input
                            type="tel"
                            placeholder="New Owner's Phone Number"
                            value={newOwnerPhoneNumber}
                            onChange={(e) => setNewOwnerPhoneNumber(e.target.value)}
                        />
                        <button onClick={handleChangeOwnership} disabled={loading}>
                            {loading ? <LoadingSpinner /> : 'Change Ownership'}
                        </button>
                        <p>{message}</p>
                    </div>
                )}
            </div>

            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} ETrac Zambia. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default ChangeOwnership;
