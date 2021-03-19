const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

//Uvitacia strana
router.get('/', (req, res) => res.render('Welcome'));

//Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => 
res.render('dashboard', {
    name: req.user.name
}));

router.get('/upload', ensureAuthenticated, (req,res) => res.render('upload', {
    name: req.user.name
}));


module.exports = router;
