// eventAuth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Render registration page
router.get('/register', (req, res) => {
    res.render('register');
});

// Process user registration
router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const query = "INSERT INTO attendees (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) throw err;
        res.redirect('/eventAuth/login');
    });
});

// Render login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Process user login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    const query = "SELECT * FROM attendees WHERE email = ?";
    db.query(query, [email], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const user = result[0];

            if (bcrypt.compareSync(password, user.password)) {
                req.session.user = user;
                res.redirect('/eventAuth/profile');
            } else {
                res.send('Incorrect password');
            }
        } else {
            res.send('User not found');
        }
    });
});

// Render user profile page
router.get('/profile', (req, res) => {
    if (req.session.user) {
        res.render('profile', { user: req.session.user });
    } else {
        res.redirect('/eventAuth/login');
    }
});

// Logout process
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/eventAuth/login');
});

module.exports = router;
