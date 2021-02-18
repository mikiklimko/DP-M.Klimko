const express = require('express');
const router = express.Router();

//Prihlasenie
router.get('/login', (req, res) => res.render('login'));

//Registracia
router.get('/register', (req, res) => res.render('register'));

//Registracia Handle

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //overenie vyplnenia
    if(!name || !email || !password || !password2){
        errors.push({ msg: 'Vyplnte vsetky polia'});
    }

    //overenie hesiel
    if(!password !== password2){
        errors.push({ msg: 'Hesla sa nezhoduju'});
    }

    //overenie dlzky hesla 
    if(password.length < 6){
        errors.push({ msg: 'Heslo musi mat najmenej 6 znakov'});
    }
    if(errors.length > 0){
    res.render('register', {
        errors,
        name,
        email,
        password,
        password2
    })
    } else {
        res.send('pass');
    }
});

module.exports = router;
