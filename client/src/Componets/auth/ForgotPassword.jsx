import React, { useState } from 'react';
import Axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = (e) => {
    e.preventDefault();

    Axios.post('http://localhost:3002/forgot-password', { email })
      .then((response) => {
        setMessage('Password reset link has been sent to your email.');
      })
      .catch((error) => {
        setMessage('An error occurred. Please try again.');
      });
  };

  return (
    <div className="forgotPasswordPage">
      <h2>Forgot Password</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleForgotPassword}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
