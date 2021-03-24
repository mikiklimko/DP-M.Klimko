const express = require('express');
const MulterGridfsStorage = require('multer-gridfs-storage');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');


//Uvitacia strana
router.get('/', (req, res) => res.render('Welcome'));

//Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => 
res.render('dashboard', {
    name: req.user.name
}));



//stranka na vkladanie
router.get('/uploads', (req, res) => res.render('uploads'));




/* router.get('/uploads', ensureAuthenticated, (req,res) => res.render('uploads', {
    name: req.user.name
})); */


module.exports = router;
