const express = require('express');

const bodyParser = require('body-parser');
/* 
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream'); */
const methodOverride = require('method-override');
const { ensureAuthenticated } = require('../config/auth');

const router = express.Router();

router.use(bodyParser.json());
router.use(methodOverride('_method'));

/* const db2 = process.env.MONGODB_URI;

const conn = mongoose.connect(db2, {  useNewUrlParser: true, useUnifiedTopology: true})

let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const storage = new GridFsStorage({
    url: db2,
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
 */

//Vkladanie suborov
router.get('/upload', ensureAuthenticated, (req,res) => res.render('upload', {
    name: req.user.name
}));

module.exports = router;