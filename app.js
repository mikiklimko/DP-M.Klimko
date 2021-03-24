require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


const app = express();

//Passport konfik
require('./config/passport')(passport);

// Databaza config
const db = require('./config/keys').MongoURI;

//pripojenie na mongo
const conn =  mongoose.connect  (db, {  useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Databaza pripojena'))
    .catch(err => console.log(err));

//EJS
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'viewss'));

//Bodyparser
app.use(express.urlencoded({ extended: false }));

let gfs;
console.log(conn);
 conn.then('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
  });
  const storage = new GridFsStorage({
    url: db,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

 

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
/* app.use('/upload', require('./routes/upload.js')); */


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server sa spustil na porte ${PORT}`));