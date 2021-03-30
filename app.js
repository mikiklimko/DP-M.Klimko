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
const { resolve } = require('path');
const { rejects } = require('assert');

//pripojenie na mongo
 
const conn = mongoose.connect  (db, {  useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Databaza pripojena'))
    .catch(err => console.log(err));

//EJS
/* app.use(bodyParser.json());*/
app.use(methodOverride('_method')); 
app.use(expressLayouts);
app.set('view engine', 'ejs');


//Bodyparser
app.use(express.urlencoded({ extended: false }));

/* 
let gfs;
console.log(conn);
 conn.then('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
  });

  const storage = new GridFsStorage({
    url: db,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    },
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

//Route get /uploads
// Loads form
app.get('/uploads', (req,res) =>{
  res.render('uploads');
})
 
//route post /upload
// Uploads file to db 
//to 'file' je z form v name=file
app.post('/upload', upload.single("file"), (req,res) =>{
  // res.json({file: req.file}); 
   res.redirect('/uploads')
 });

 //route gett /files
// display all files in json

app.get('/files', (req, res) => {
  gfs.files.find({}).toArray((err, files) => {
      //check if files exist
      if (!files || files.length == 0) {
          return res.status(404).json({
              err: "No files exist"
          })
      }
      // files exist
      return res.json(files)
  })
}) */

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
/* app.use('/', require('./routes/upload.js'));    */


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server sa spustil na porte ${PORT}`));