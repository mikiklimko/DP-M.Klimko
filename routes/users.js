const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
                    error.push({ msg: 'Email je uz registrovany' })
                    res.render('register', {
                        errors,
                        name: req.body.name,
                        email: req.body.email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password,
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
                    const token = jwt.sign(
                        { email: email },
                        'process.env.RANDOM_TOKEN_SECRET',
                        { expiresIn: '24h' }

                    );
                   
                   /*  //nodemailer setup
                        var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.LOG_EMAIL,
                            pass: process.env.LOG_PASS
                        }
                    });
                    var mailOptions = {
                        from: 'dp.klimko@gmail.com',
                        to: `${req.body.Email}`,
                        subject: 'Sending Email using Node.js',
                        html: `<h1>ODOSLANE SPRAVNE</h1><br> <a href="http://localhost:5000/activate?key=${token}"> Pre overenie klikni `
                      };
                      transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      }); */
                   
                    console.log(newUser);
                    console.log(token);

                    /* var decoded = jwt.decode(token)
                    var decoded = jwt.decode(token, { complete: true });
                    console.log(decoded.header);
                    console.log(decoded.payload) */

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
        failureFlash: 'Nezadali ste email a heslo alebo vas ucet nie je verifikovany skontrolujte si email'
    })(req, res, next);
});
//Odhlasovanie
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Odhlasili ste sa');
    res.redirect('/users/login');
});


module.exports = router;
