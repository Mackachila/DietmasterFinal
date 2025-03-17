//imports

const express = require('express');
const path = require('path');
const { isAuthenticated, isUserAuthenticated,  isAdminAuthenticated} = require('../middlewares/auth');

const router = express.Router();


// Serving static pages

//serving registration page
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

//serving registration page
router.get('/doctor_registration', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'doctor_registration.html'));
});

// Serving loging page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// Serving loging page
router.get('/doctor_login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'doctor_login.html'));
});


 // Serving meals update page
 router.get('/add_meal', isAdminAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'add_meal.html'));
});

// Serving meals update page
router.get('/doctorreports', isAdminAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'doctorreports.html'));
});

// Serving meals update page
router.get('/reports', isUserAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'reports.html'));
});

//serving dashboard page
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

//serving detail confirmation page
router.get('/updates', isUserAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'updates.html'));
});

//serving meal scheduling page
router.get('/schedule', isUserAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'schedule.html'));
});

//serving meal scheduling page
router.get('/account', isUserAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'account.html'));
});

//serving meal scheduling page
router.get('/doctor_account', isAdminAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'doctor_account.html'));
});
//serving meal scheduling page
router.get('/analysis', isUserAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'analysis.html'));
});

//serving meal scheduling page
router.get('/doctor_analysis', isAdminAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'doctor_analysis.html'));
});

//serving meal scheduling page
router.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});


router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});



module.exports = router;
