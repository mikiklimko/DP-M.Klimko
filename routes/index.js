const express = require('express');
const MulterGridfsStorage = require('multer-gridfs-storage');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');



//Uvitacia strana
router.get('/', (req, res) => res.render('Welcome'));

//Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => 
res.render('dashboard', {
    name: req.user.name,
    email: req.user.email
}));



//stranka na vkladanie
router.get('/uploads', (req, res) => res.render('uploads'));


const User = require('../models/User');

//vypis registrovanych
router.get('/customers', ensureAuthenticated, (req, res) => {
    const email = req.user.email
    if( email === process.env.ADMIN) {
    User.find({}, function(err, users){
        res.render('customers', {
        userList: users
    });
});
//neprehodi ma na /dashboard s err msg, ale ostane na /customers
    } else {
        req.flash('error_msg', 'Nie si admin');
        res.render('dashboard',{
            name: req.user.name
        });
       
    };    
})


/* router.get('/uploads', ensureAuthenticated, (req,res) => res.render('uploads', {
    name: req.user.name
})); */


module.exports = router;
