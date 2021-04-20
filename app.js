require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const app = express();

//Passport konfik
require('./config/passport')(passport);

// Databaza config
const db = require('./config/keys').MongoURI;

//pripojenie na mongo
 
mongoose.connect  (db, {  useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Databaza pripojena'))
    .catch(err => console.log(err));

//EJS
app.use(express.urlencoded());
app.use(express.json());
app.use(methodOverride('_method')); 
app.use(expressLayouts);
app.set('view engine', 'ejs');


//Bodyparser
app.use(express.urlencoded({ extended: false }));

//Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());


// Connect flash
app.use(flash());

//Globalne premenne
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server sa spustil na porte ${PORT}`));