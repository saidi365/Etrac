import React, { useState } from 'react';
import './FlagPhonePage.css'
import { useHistory, useParams } from 'react-router-dom';

const FlagPhonePage = () => {
    const [selectedOption, setSelectedOption] = useState('');
    const { phoneId } = useParams(); // Get phoneId from URL parameters
    const history = useHistory();

    // Handle option selection
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedOption) {
            alert('Please select an option.');
            return;
        }

        try {
            const response = await fetch(`/api/phones/${phoneId}/flag`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ option: selectedOption }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                history.push('/dashboard'); // Redirect to the dashboard after submission
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong, please try again.');
        }
    };

    return (
        <div className="flagPhonePage">
            <h2>Flag Phone as Missing or Stolen</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        <input
                            type="radio"
                            value="prompt"
                            checked={selectedOption === 'prompt'}
                            onChange={handleOptionChange}
                        />
                        Prompt anyone searching for this phone that it is flagged as Missing/Stolen
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="radio"
                            value="notify"
                            checked={selectedOption === 'notify'}
                            onChange={handleOptionChange}
                        />
                        Notify the system whenever someone searches for this phone
                    </label>
                </div>
                <button type="submit" disabled={!selectedOption}>
                    Submit
                </button>
            </form>
        </div>
    );
};

export default FlagPhonePage;
