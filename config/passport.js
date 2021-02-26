const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Nacitanie usera
const User = require('../models/User');


module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            //Zhoda uzivatela podla emailu
            User.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'Tento email nie je zaregistrovany' });
                    }
                    // Zhoda hesiel
                   
                    bcrypt.compare(password, user.password, (err, isMatch ) => {
                        if(err) throw err;

                        if(isMatch){
                          return done(null, user);  
                        } else {
                            return done(null, false, { message: 'Zadali ste nespravne heslo!'})
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
          done(err, user);
        });
      });
}