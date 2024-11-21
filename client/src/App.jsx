// src/App.jsx
import './App.css';
import Dashboard from './Componets/Dashboard/Dashboard';
import Login from './Componets/Login/Login';
import Register from './Componets/Register/Register';
import ChangeOwnership from './Componets/changeowner/changeownership';
import ForgotPassword from './Componets/auth/ForgotPassword';
import RegisterPhone from './Componets/RegisterPhone/RegisterPhone'; // Import the RegisterPhone component
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Create a router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />, // Login component as default route
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/register-phone', // Add the Register Phone route here
    element: <RegisterPhone />, 
  },
  {
    path: '/forgot-password', // Add the Forgot Password route here
    element: <ForgotPassword />, 
  },
  {
    path: '/change-ownership/:phoneId', // Change Ownership route
    element: <ChangeOwnership />, 

  },
  
  {
    path: '*', // Catch-all route for 404
    element: <h2>404: Page Not Found</h2>,
  },
  
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
