import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import Axios from 'axios';

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [phoneDetails, setPhoneDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);  // Track current page
  const [itemsPerPage, setItemsPerPage] = useState(5); // Number of items per page
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch user count and phone details
    const fetchData = async () => {
      try {
        const userCountResponse = await Axios.get('http://localhost:3002/api/admin/user-count', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setUserCount(userCountResponse.data.count);

        const phoneDetailsResponse = await Axios.get('http://localhost:3002/api/admin/phone-details', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setPhoneDetails(phoneDetailsResponse.data.phones);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Calculate total pages based on the total phone details
  const totalPages = Math.ceil(phoneDetails.length / itemsPerPage);

  // Display the phones for the current page
  const displayedPhones = phoneDetails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="adminDashboard">
      <h1>Admin Dashboard</h1>
      <div className="userCount">
        <h2>Total Registered Users: {userCount}</h2>
      </div>

      <div className="phoneDetails">
        <h2>All Phone Details</h2>
        {phoneDetails.length > 0 ? (
          displayedPhones.map((phone) => (
            <div key={phone.id} className="phoneCard">
              <h3>{phone.gadgetName}</h3>
              <p>Owner: {phone.owner}</p>
              <p>Phone Number: {phone.phoneNumber}</p>
              <p>Color: {phone.color}</p>
              <p>Storage: {phone.storage}</p>
              <p>NRC: {phone.nrc}</p>
              <p>Date Registered: {new Date(phone.datecreated).toLocaleDateString()}</p>
              <p>IMEI: {phone.imeis}</p>
            </div>
          ))
        ) : (
          <p>No phones found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {phoneDetails.length > itemsPerPage && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
