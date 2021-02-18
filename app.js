const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const path = require('path');



const app = express();

// Databaza config
const db = require('./config/keys').MongoURI;

//Bodyparser
app.use(express.urlencoded({ extended: false}));


//pripojenie na mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Databaza pripojena'))
    .catch(err => console.log(err));

//EJS
app.use(expressLayouts);

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views')); 



//routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server sa spustil na porte ${PORT}`));