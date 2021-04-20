const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { ensureAuthenticated } = require('../config/auth');


//Uzivatelsky model
const User = require('../models/User');

//Prihlasenie
router.get('/login', (req, res) => res.render('login'));

//Registracia
router.get('/register', (req, res) => res.render('register'));

router.get('/form', ensureAuthenticated, (req, res) =>
    res.render('form', {
        name: req.user.name,
        email: req.user.email
    }));

//Registracia Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //overenie vyplnenia
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Vyplňte všetky polia! ' });
    }

    //overenie hesiel
    if (password !== password2) {
        errors.push({ msg: 'Hesla sa nezhodujú! ' });
    }

    //overenie dlzky hesla 
    if (password.length < 6) {
        errors.push({ msg: 'Heslo musí mať najmenej 6 znakov! ' });
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
                    error.push({ msg: 'Email je už registrovaný' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const token = jwt.sign(
                        { email: email },
                        'process.env.RANDOM_TOKEN_SECRET',
                        { expiresIn: '24h' }
                    );


                    const newUser = new User({
                        name,
                        email,
                        password,
                        token,
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
                                    req.flash('success_msg', 'Si úspešné zaregistrovaný. Pre prihlásenie sa prosím overte svoj email! ');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        }));

                    console.log(token);

                    //nodemailer setup
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.LOG_EMAIL,
                            pass: process.env.LOG_PASS
                        }
                    });
                    console.log(transporter)
                    var mailOptions = {
                        from: 'dp.klimko@gmail.com',
                        to: `${email}`,
                        subject: 'Overenie emailu',
                        html: `<h1>ODOSLANE SPRAVNE</h1><br> <a href="http://localhost:5000/users/verify?key=${token}"> Pre overenie klikni `
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }
            });
    }
});




//prihlasovacie handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: 'Nezadali ste email a heslo alebo váš účet nie je verifikovany skontrolujte si email! '
    })(req, res, next);
});
//Odhlasovanie
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Odhlasili ste sa');
    res.redirect('/users/login');
});
// Verifikacia po kliknuti
router.get('/verify', (req, res) => {
    const token = req.query.key;
    var decoded = jwt.decode(token);
    console.log(decoded);
    User.findOne({ token: token })
        .then(user => {
            console.log(user);
            if (user.email === decoded.email) {
                // TODO decoded.exp aktualny cas(iat) > expirovany cas(exp) (pozor exp je asi v sec)
                // TODO setnut token ""
                console.log("verifikujeme")
                var filter = { email: user.email };
                var update = { $set: { isVerified: true } };
                User.updateOne(filter, update, (err, res) => {
                    if (err) throw err;
                    console.log("aktualizovana db")

                })
                req.flash('success_msg', 'Verifikoval si sa');
                res.redirect('/users/login')
            } else {


                console("chyba")
                //TODO chyba z endpointu

            }

        });


});
//ODOSIELANIE EMAILU PRE OBNOVU HESLA
router.post('/password', (req, res) => {
    const { email } = req.body;
    let errors = [];
    //overenie zadanie emailu
    if (!email) {
        errors.push({ msg: 'Vyplnte e-mail!' });
    }

    if (errors.length > 0) {
        res.render('password', {
            errors,
            email,
        });

    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    console.log(user);
                    const token = user.token
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.LOG_EMAIL,
                            pass: process.env.LOG_PASS
                        }
                    });

                    var mailOptions = {
                        from: 'dp.klimko@gmail.com',
                        to: `${email}`,
                        subject: 'OBNOVA HESLA',
                        html: `<h1>ODOSLANE SPRAVNE</h1><br> <a href="http://localhost:5000/users/resetpass?key=${token}"> Pre obnovenie hesla `
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    console.log(email);

                    req.flash('success_msg', 'Email bol poslany');
                    res.redirect('/users/password');
                }
            })
    }


});

router.get('/password', (req, res) => {
    res.render('password')
});

//OBNOVA HESALA
router.get('/resetpass', (req, res) => {

    const token = req.query.key;
    var decoded = jwt.decode(token);
    console.log(decoded);

    /* User.findOne({ token: token })
    .then(user => {
        console.log(user);
        if (user.email === decoded.email) { 

         }
    }); */
    res.render('resetpass', { email: decoded.email || "" })
});


//OBNOVA HESALA
router.post('/resetpass', (req, res) => {
    console.log(req.body)

    const { email } = req.body
    User.findOne({ email: email })
        .then(user => {
            if (user) {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if (err) throw err;
                        req.body.password = hash;
                        console.log(req.body.password)
                        var filter = { email: email }
                        var update = { $set: { password: req.body.password } }
                        User.updateOne(filter, update, (err, res) => {
                            if (err) throw err;
                            console.log("ZMENA PW")

                        })
                    })

                })

                res.send(200)
            } else {
                res.send(500)
            }

        });
    /*  };  */

});


//Formular a aktualizacia DB
router.post('/form', (req, res) => {
    const { adresa, mesto, PSC, telefon, ubytovanie, strava } = req.body;
    let errors = [];
    if (!adresa || !mesto || !PSC || !telefon) {
        errors.push({ msg: 'Vyplňte všetky polia! ' });
    }
    if (errors.length > 0) {
        res.render('form', {
            errors,
            adresa,
            mesto,
            PSC,
            telefon,
            ubytovanie,
            strava
        });
    } else {
        const email = req.user.email;
        console.log(email);
        var filter = { email: email }
        var update = { $set: { adresa: adresa, mesto: mesto, PSC: PSC, telefon: telefon, ubytovanie: ubytovanie, strava: strava } }
        User.updateOne(filter, update, (err, res) => {
            if (err) throw err;
            console.log("Doplnenie DB")
        })
        console.log(adresa, mesto, PSC, telefon, ubytovanie, strava);
        req.flash('success_msg', 'Ďakujeme za vyplnenie');
        res.redirect('/users/form')
    }

});




module.exports = router;
