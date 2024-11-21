import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserCount = () => {
    const [userCount, setUserCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const token = localStorage.getItem('token'); // Adjust based on your token storage
                const response = await axios.get('http://localhost:3002/api/users/count', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUserCount(response.data.userCount);
            } catch (error) {
                console.error('Error fetching user count:', error);
                setUserCount('Error fetching user count');
            } finally {
                setLoading(false);
            }
        };

        fetchUserCount();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Total Users</h2>
            <p>{userCount}</p>
        </div>
    );
};

export default UserCount;
