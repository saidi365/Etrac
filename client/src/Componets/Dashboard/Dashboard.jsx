import React, { useState } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import logo from '../../LoginAssets/logo.png';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneDetails, setPhoneDetails] = useState([]);
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedFlagOption, setSelectedFlagOption] = useState('');
  const [currentPhoneId, setCurrentPhoneId] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const itemsPerPage = 2;
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const username = token ? JSON.parse(atob(token.split('.')[1])).username.toLowerCase().trim() : '';

  const handleSearch = (e) => {
    e.preventDefault();
    setMessage('');

    Axios.post('http://localhost:3002/api/phones/search', { term: searchTerm }, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then((response) => {
        const { results, flaggedPhoneMessage } = response.data;

        if (results.length > 0) {
            setPhoneDetails(results);
            setMessage('Search results:');
            setCurrentPage(1);

            // Check for flagged phone messages and alert if present
            if (flaggedPhoneMessage) {
                alert(flaggedPhoneMessage);  // Alert with all flagged messages
            }
        } else {
            setMessage('No results found for the given input.');
        }
    })
    .catch(() => {
        setMessage('Error fetching phone details. Please try again.');
    });
};




  const handleDelete = async (phoneId) => {
    try {
      await Axios.delete(`http://localhost:3002/api/phones/${phoneId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage('Phone deleted successfully.');
      setPhoneDetails(prevDetails => prevDetails.filter(phone => phone.id !== phoneId));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error deleting phone. Please try again.');
    }
  };

  const handleFlagPhone = (phoneId, e) => {
    setCurrentPhoneId(phoneId);
    const rect = e.target.getBoundingClientRect();
    setModalPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
    });
    setShowModal(true);
};

const handleUnflag = (phoneId) => {
    Axios.post('http://localhost:3002/api/phones/flag', {
        phoneId: phoneId,
        flagStatus: 'unflag'
    }, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => {
        setMessage('Phone unflagged successfully.');
        setPhoneDetails(prevDetails =>
            prevDetails.map(phone =>
                phone.id === phoneId ? { ...phone, isFlagged: null } : phone
            )
        );
    })
    .catch(() => {
        setMessage('Error unflagging phone. Please try again.');
    });
};


const handleModalSubmit = () => {
  if (selectedFlagOption) {
    Axios.post('http://localhost:3002/api/phones/flag', {
      phoneId: currentPhoneId,
      flagStatus: selectedFlagOption
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => {
      const statusMessage = selectedFlagOption === 'unflag'
        ? 'Phone unflagged successfully.'
        : `Phone flagged as ${selectedFlagOption}.`;

      setMessage(statusMessage);
      setShowModal(false);
    })
    .catch(() => {
      setMessage('Error flagging phone. Please try again.');
      setShowModal(false);
    });
  }
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

  const totalPages = Math.ceil(phoneDetails.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const displayedPhones = phoneDetails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboardPage">
      <div className="navbar">
        <div className="logo-container">
          <img src={logo} alt="ETrac Logo" className="logo" />
          <h1>ETrac Zambia</h1>
        </div>
        <div className="navButtons">
          <button onClick={() => window.location.reload()} className="navButton">Home</button>
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
            <button onClick={() => window.location.reload()} className="dropdownItem">Home</button>
            <button onClick={() => navigate('/register-phone')} className="dropdownItem">Register Phone</button>
            <button onClick={() => navigate('/about')} className="dropdownItem">About</button>
            <button onClick={handleLogout} className="dropdownItem">Logout</button>
          </div>
        )}
      </div>

      <form className="searchForm" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by NRC or IMEI"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search by NRC or IMEI"
        />
        <button type="submit">Search</button>
      </form>

      <h2>{message}</h2>
      <div className="phoneDetails">
  {displayedPhones.map((phone) => (
    <div
      key={phone.id}
      className={`phoneCard ${phone.isFlagged ? 'flaggedPhone' : ''}`}
    >
      <h3>{phone.gadgetName}</h3>
      <p>Owner: {phone.owner ? phone.owner : 'Owner not available'}</p>
      <p>Phone Number: {phone.phoneNumber}</p>
      <p>Color: {phone.color}</p>
      <p>Storage: {phone.storage}</p>
      <p>NRC: {phone.nrc}</p>
      <p>Date Registered: {new Date(phone.datecreated).toLocaleDateString()}</p>
      <p>IMEI: {phone.imeis ? phone.imeis.split(',').join(', ') : 'No IMEIs registered'}</p>

      {/* Display Flagged Icon */}
      {phone.isFlagged && (
        <div className="flagged-icon">
          <i className="fa fa-exclamation-triangle" title="Flagged as Missing or Stolen"></i>
        </div>
      )}

      {username && phone.owner && phone.owner.trim().toLowerCase() === username && (
        <div className="actions">
          <button onClick={() => navigate(`/change-ownership/${phone.id}`)}>Change Ownership</button>
          <button onClick={(e) => handleFlagPhone(phone.id, e)}>
            {phone.isFlagged ? 'Unflag as Missing/Stolen' : 'Flag as Missing/Stolen'}
          </button>
        </div>
      )}
    </div>
  ))}
</div>




      {/* Pagination Controls */}
      {phoneDetails.length > itemsPerPage && (
        <div className="pagination">
          {currentPage > 1 && (
            <button onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
          )}
          <span>Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages && (
            <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
          )}
        </div>
      )}

      {/* Flag Phone Modal */}
    {/* Flag Phone Modal */}
{showModal && (
  <div className="modalOverlay">
    <div className="modalContent" style={{ top: `${modalPosition.top}px`, left: `${modalPosition.left}px` }}>
      <h2>Flag Phone as Stolen or Missing</h2>
      <div>
        <label>
          <input
            type="radio"
            value="stolen"
            checked={selectedFlagOption === 'stolen'}
            onChange={() => setSelectedFlagOption('stolen')}
          />
          Flag as Stolen
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="missing"
            checked={selectedFlagOption === 'missing'}
            onChange={() => setSelectedFlagOption('missing')}
          />
          Flag as Missing
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="unflag"
            checked={selectedFlagOption === 'unflag'}
            onChange={() => setSelectedFlagOption('unflag')}
          />
          Unflag
        </label>
      </div>
      <button onClick={handleModalSubmit} disabled={!selectedFlagOption}>Submit</button>
      <button onClick={() => setShowModal(false)}>Close</button>
    </div>
  </div>
)}


      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} ETrac Zambia. All rights reserved.</p>
      </footer>
    </div>
  );
};



export default Dashboard;
