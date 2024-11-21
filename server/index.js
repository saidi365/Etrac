// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Changed to mysql2 for promise support
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');



require('dotenv').config();
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // For Hostinger SMTP
    port: 587, // Or use 465 for SSL
    secure: false, // Use true if using port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Initialize express
const app = express();

// Allow requests from the frontend URL
app.use(cors({
    origin: 'http://localhost:5173' // Replace with your frontend URL
}));

// Server Port
const PORT = 3002;

// Middleware
app.use(bodyParser.json());

// MySQL Database connection using mysql2
const db = mysql.createPool({
    user: 'root', // Change to your MySQL username
    host: 'localhost',
    password: '', // Change to your MySQL password
    database: 'etracdb' // Change to your database name
});

// Middleware to verify token for protected routes
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}


// Function to send an email
async function sendEmail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: 'your-email@gmail.com', // Replace with your email
            to,
            subject,
            text
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// ============================
// Routes
// ============================

// Endpoint to toggle the flag status of a phone
app.post('/api/phones/flag', authenticateToken, async (req, res) => {
    const { phoneId, flagStatus } = req.body;
    const userId = req.user.id;

    try {
        const [phone] = await db.query('SELECT * FROM phones WHERE id = ? AND owner = ?', [phoneId, userId]);
        if (!phone.length) {
            return res.status(403).json({ message: 'You do not have permission to flag this phone.' });
        }

        await db.query('UPDATE phones SET isFlagged = ? WHERE id = ?', [flagStatus, phoneId]);
        res.json({ message: flagStatus ? 'Phone flagged as stolen/missing.' : 'Phone unflagged.' });
    } catch (error) {
        console.error('Error updating flag status:', error);
        res.status(500).json({ message: 'Error updating flag status.' });
    }
});

// Modified search route to highlight flagged phones
app.post('/api/phones/search', async (req, res) => {
    const { term } = req.body;

    if (!term || term.trim() === '') {
        return res.status(400).json({ success: false, message: 'Please provide an NRC or IMEI number' });
    }

    try {
        const [results] = await db.query(`
            SELECT phones.id, phones.gadgetName, users.username AS owner, phones.phoneNumber, phones.color, 
                   phones.storage, phones.datecreated, phones.nrc, phones.isFlagged, GROUP_CONCAT(imeis.imei) AS imeis
            FROM phones
            LEFT JOIN imeis ON phones.id = imeis.phone_id
            LEFT JOIN users ON phones.owner = users.id
            WHERE phones.nrc = ? OR imeis.imei = ?
            GROUP BY phones.id
        `, [term, term]);

        if (results.length > 0) {
            const flaggedMessages = results
              .filter(phone => phone.isFlagged === 'stolen' || phone.isFlagged === 'missing')
              .map(phone => `The phone with IMEI ${phone.imeis} is flagged as ${phone.isFlagged === 'missing' ? 'missing' : 'stolen'}.`);


            if (flaggedMessages.length > 0) {
                res.json({
                    results,
                    flaggedPhoneMessage: flaggedMessages.join('\n'),
                });
            } else {
                res.json({ results });
            }
        } else {
            res.status(404).json({ success: false, message: 'No phone details found for the given NRC or IMEI' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Login IMEI Search Route - retrieves only phone color for login page
app.get('/api/login-search/:imei', async (req, res) => {
    const imei = req.params.imei;

    try {
        const [result] = await db.query(`
            SELECT color 
            FROM phones 
            JOIN imeis ON phones.id = imeis.phone_id 
            WHERE imeis.imei = ?
        `, [imei]);

        if (result.length > 0) {
            res.json({ success: true, color: result[0].color });
        } else {
            res.status(404).json({ success: false, message: 'Phone not found for this IMEI' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Register route with email sending
app.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // Check if the email already exists
        const [emailCheck] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (emailCheck.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
// Sending email after successful registration
const mailOptions = {
    from: process.env.EMAIL_USER,  // Your email address
    to: email,  // Recipient's email address
    subject: 'Welcome to Etrac',  // Subject line
    text: `Hello ${username},\n\nThank you for registering with Etrac! We are excited to have you on board.\n\nBest regards,\nEtrac Team`  // Email body text
};

// Send the email
transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
        console.error('Error sending email:', err);
    } else {
        console.log('Email sent: ' + info.response);
    }
});

        res.status(201).json({ success: true, message: 'User registered successfully' });

    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, message: 'Error creating user' });
    }
});



// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (result.length === 0) return res.status(400).json({ success: false, message: 'Invalid email or password' });

        const user = result[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ success: false, message: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, 'your_secret_key', { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Check if email exists
app.post('/api/users/check-email', async (req, res) => {
    const { email } = req.body;

    // Validate that email is provided
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    // Query the database to check if the email exists
    try {
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        // If the results array is empty, the email does not exist
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Email not found.' });
        }
        // If the email exists, return success
        res.json({ success: true, message: 'Email exists.' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
app.post('/api/phones/register', authenticateToken, async (req, res) => {
    const { imeis, color, storage, date, gadgetName, phoneNumber, nrc } = req.body;
    const userId = req.user.id;

    try {
        // Check if any of the IMEIs already exist
        const [existingImeis] = await db.query(
            'SELECT imei FROM imeis WHERE imei IN (?)',
            [imeis]
        );

        if (existingImeis.length > 0) {
            // Extract existing IMEI values for better feedback
            const duplicateImeis = existingImeis.map((row) => row.imei);
            return res.status(400).json({ 
                success: false, 
                message: `IMEI(s) already registered: ${duplicateImeis.join(', ')}` 
            });
        }

        // Register the phone
        const [phoneResult] = await db.query(
            'INSERT INTO phones (gadgetName, owner, phoneNumber, color, storage, datecreated, nrc) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [gadgetName, userId, phoneNumber, color, storage, date, nrc]
        );

        const phoneId = phoneResult.insertId;

        // Insert IMEIs for the phone
        const imeiRecords = imeis.map((imei) => [phoneId, imei]);
        await db.query(
            'INSERT INTO imeis (phone_id, imei) VALUES ?',
            [imeiRecords]
        );

        res.json({ success: true, message: 'Phone registered successfully!' });
    } catch (error) {
        console.error('Error registering phone:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/phones/flag', authenticateToken, async (req, res) => {
    const { phoneId, flagStatus } = req.body;
    const userId = req.user.id;

    // Validate flag status (now including "stolen" and "missing")
    if (!['stolen', 'missing', 'unflag'].includes(flagStatus)) {
        return res.status(400).json({ message: 'Invalid flag status' });
    }

    try {
        // Ensure phone ownership before flagging
        const [phone] = await db.query('SELECT * FROM phones WHERE id = ? AND owner = ?', [phoneId, userId]);
        if (!phone.length) {
            return res.status(403).json({ message: 'Permission denied to flag this phone.' });
        }

        // Update flag status
        const newFlagStatus = flagStatus === 'unflag' ? null : flagStatus;
        await db.query('UPDATE phones SET isFlagged = ? WHERE id = ?', [newFlagStatus, phoneId]);

        const message = flagStatus === 'unflag' ? 'Phone unflagged successfully.' : `Phone flagged as ${flagStatus}.`;
        res.json({ message });
    } catch (error) {
        console.error('Error updating flag status:', error);
        res.status(500).json({ message: 'Error updating flag status.' });
    }
});

app.put('/api/phones/change-ownership', authenticateToken, async (req, res) => {
    const { phoneId, newOwnerEmail, newOwnerNRC, newOwnerPhoneNumber } = req.body;
    const currentOwner = req.user.id;  // The logged-in user's id, not username

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Step 1: Verify the current owner is the actual owner of the phone
        const [phone] = await connection.query(
            'SELECT * FROM phones WHERE id = ? AND owner = ?',
            [phoneId, currentOwner]
        );

        // If no phone is found or the current user isn't the owner
        if (!phone.length) {
            await connection.rollback();
            return res.status(403).json({ message: 'Permission denied. You are not the owner of this phone.' });
        }

        // Step 2: Check if the new owner is a registered user
        const [newOwner] = await connection.query('SELECT * FROM users WHERE email = ?', [newOwnerEmail]);
        if (!newOwner.length) {
            await connection.rollback();
            return res.status(404).json({ message: 'New owner is not a registered user. Please register them first.' });
        }

        // Step 3: Log the current ownership details in the phone_history table
        const { owner, phoneNumber, nrc, datecreated } = phone[0];  // Get the old owner details
        const event = 'Ownership Change';  // Example event name
        const isFlagged = 'prompt';  // Example flag value
        
        console.log('Inserting into phone_history with:', { phoneId, owner, phoneNumber, nrc, datecreated, event, isFlagged });

        const historyResult = await connection.query(
            'INSERT INTO phone_history (phone_id, previous_owner, previous_phone_number, previous_nrc, previous_date, event, isFlagged) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [phoneId, owner, phoneNumber, nrc, datecreated, event, isFlagged]
        );

        console.log('Phone history inserted:', historyResult);

        // Step 4: Update the ownership details for the phone
        const updateResult = await connection.query(
            'UPDATE phones SET owner = ?, phoneNumber = ?, nrc = ?, datecreated = NOW() WHERE id = ?',
            [newOwner[0].id, newOwnerPhoneNumber, newOwnerNRC, phoneId]
        );

        console.log('Phone ownership updated:', updateResult);

        // Commit the transaction
        await connection.commit();
        res.json({ message: 'Ownership changed successfully!' });

    } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        console.error('Error changing ownership:', error);
        res.status(500).json({ message: 'An error occurred while changing ownership.' });
    } finally {
        connection.release();
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
