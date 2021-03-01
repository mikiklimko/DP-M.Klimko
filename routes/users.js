const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Uzivatelsky model
const User = require('../models/User');

//Prihlasenie
router.get('/login', (req, res) => res.render('login'));

//Registracia
router.get('/register', (req, res) => res.render('register'));

//Registracia Handle

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //overenie vyplnenia
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Vyplnte vsetky polia! ' });
    }

    //overenie hesiel
    if (password !== password2) {
        errors.push({ msg: 'Hesla sa nezhoduju! ' });
    }

    //overenie dlzky hesla 
    if (password.length < 6) {
        errors.push({ msg: 'Heslo musi mat najmenej 6 znakov! ' });
    }
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //validacia 
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //existujuci uzivatel
                    error.push({msg: 'Email je uz registrovany'})
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    //Hash hesla
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                          if (err) throw err;
                          //Nastavenie hasovania hesla
                          newUser.password = hash;
                          // Ulozenue usera
                          newUser.save()
                          .then(user => {
                              req.flash('success_msg', 'Si uspesne zaregistrovany');
                              res.redirect('/users/login');
                          })
                          .catch(err => console.log(err));
                    }))
                    
                    //vypis uzivatela v cosole
                   //console.log(newUser)
                   //res.send('Ahoj');
                }
            });
    }
});

//prihlasovacie handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: 'Nezadali ste email a heslo'
        })(req, res, next);
});
//Odhlasovanie
router.get('/logout', (req,res) =>{
    req.logout();
    req.flash('success_msg', 'Odhlasili ste sa');
    res.redirect('/users/login');
});


module.exports = router;
