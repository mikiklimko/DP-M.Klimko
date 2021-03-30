/* const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream'); 
const methodOverride = require('method-override');
const { ensureAuthenticated } = require('../config/auth');
const { rejects } = require('assert');
const { resolve } = require('path');

const router = express.Router();

router.use(methodOverride('_method'));


const db2 = process.env.MONGODB_URI;
const conn = mongoose.connect(db2, {  useNewUrlParser: true, useUnifiedTopology: true})

//Init gfs
let gfs;

conn.then('once', ()=>{
  //Init stream
  gfs = Grid(conn.db,mongoose.mongo);
  gfs.collection('uploads')
});

//Create storage engine
const storage = new GridFsStorage({
  url:db2,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  file: (req,file) => {
    return new Promise((resolve, reject) =>{
      crypto.randomBytes(16, (err, buf) => {
        if(err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename : filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({storage});

//Route get /uploads
// Loads form
router.get('/uploads', (req,res) =>{
  res.render('uploads');
})

//route post /upload
// Uploads file to db 
//to 'file' je z form v name=file
router.post('/upload', upload.single("file"), (req,res) =>{
 // res.json({file: req.file}); 
  res.redirect('/uploads')
});


//route gett /files
// display all files in json

router.get('/files', (req, res) => {
 
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if(!files || files.lenght === 0){
      return res.status(404).json({
        err: 'Nofile',
       
      });
    } 
    // file exist
    return res.json(files);
  });
});


module.exports = router;  */