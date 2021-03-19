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
                                    req.flash('success_msg', 'Si uspesne zaregistrovany. Pre prihlasenie sa prosim overte svoj email');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        }))

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
                        subject: 'Sending Email using Node.js',
                        html: `<h1>ODOSLANE SPRAVNE</h1><br> <a href="http://localhost:5000/users/verify?key=${token}"> Pre overenie klikni `
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                    /* console.log(newUser);
                    console.log(token); */

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
                var filter = {email: user.email};
                var update = {$set: {isVerified: true} };
                User.updateOne(filter, update, (err,res)=>{
                    if (err) throw err;
                    console.log("aktualizovana db")
                    })

            

            } else {

                console("chyba")
                //TODO chyba z endpointu
            }

        });
    
    req.flash('success_msg', 'Verifikoval si sa');
    res.redirect('/users/login')
});


module.exports = router;
