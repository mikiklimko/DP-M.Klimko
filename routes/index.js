const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');


//Uvitacia strana
router.get('/', (req, res) => res.render('Welcome'));

router.get('/home', ensureAuthenticated, (req, res) =>
    res.render('home', {
        name: req.user.name,
        email: req.user.email

    }));

//Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
 
    res.render('dashboard', {
        name: req.user.name,
        email: req.user.email,
        adresa: req.user.adresa,
        mesto: req.user.mesto,
        PSC: req.user.PSC,
        telefon: req.user.telefon,
        ubytovanie: req.user.ubytovanie,
        strava: req.user.strava
    });
        });



/* //stranka na vkladanie
router.get('/uploads', (req, res) => res.render('uploads')); */


const User = require('../models/User');


//vypis registrovanych
router.get('/customers', ensureAuthenticated, (req, res) => {
    const email = req.user.email
    if (email === process.env.ADMIN) {
        User.find({}, function (err, users) {
            res.render('customers', {
                userList: users
            });
        });

    } else {
        req.flash('error_msg', 'Nie si admin');
        res.render('dashboard', {
            name: req.user.name,
            email: req.user.email
        });

    };
})


const url = require('../config/keys').MongoURI;
const connect = mongoose.createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let gfs;
connect.once('open', () => {
    // Init stream
    gfs = Grid(connect.db, mongoose.mongo);
    gfs.collection('uploads');
});

//storage engine
const storage = new GridFsStorage({
    url: url,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = file.originalname;
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            };
            resolve(fileInfo);
        });
    }
});
const upload = multer({ storage });

//@route GET /uploads
// Loads form
router.get('/uploads', ensureAuthenticated, (req, res) => {
    gfs.files.find().toArray((err, files) => {
        //check if files exist
        if (!files || files.length == 0) {
            res.render('uploads', { files: false },
            );
        } else {
            files.map(file => {
                const imageType = ['image/png', 'image/jpg', 'image/gif', 'image/jpeg']
                if (imageType.includes(file.connect)) {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });
            res.render('uploads', { files: files, email: req.user.email },);
        }
    });
});


//@route POST /upload
// Upload file to DB
router.post('/upload', upload.single('file'), (req, res) => {
    const id = req.file.id;
    console.log(id)
    const abstrakt = req.body.abstrakt;
    const keywords = req.body.keywords;

    console.log(abstrakt);
    console.log(keywords);

    gfs.files.findOne({ _id: id }, (err, file) => {
        gfs.files.update(
            { _id: id },
            { $set: { abstrakt: abstrakt, keywords: keywords } }
        )
        if (err) throw err;
        console.log("Doplnenie DB")
    });

    res.redirect('/uploads');
});

// @route get /files
// Display all files in json
router.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        //check if files exist
        if (!files || files.length == 0) {
            return res.status(404).json({
                err: "Ziaden subor"
            })
        }
        // files exist
        return res.json(files)
    });
});

// @route get /files/:filename
// Display single file object
router.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file) {
            return res.status(404).json({
                err: "Ziaden subor"
            })
        }
        //file exist
        return res.json(file);
    });
});

//@route download / files /:id
// download file
router.get('/download/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file) {
            return res.status(404).json({ err: err });
        }
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);

    })
});


// @route get /image/:filename
// Display image
router.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file) {
            return res.status(404).json({
                err: "Ziaden subor"
            })
        }
        // Check if Image
        const imageType = ['image/png', 'image/jpg', 'image/gif', 'image/jpeg']
        if (imageType.includes(file.connect)) {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Bez obrázka'
            });
        }
    });
});



//@route delet / files /:id
// Delete file
router.delete('/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ err: err });
        }

        res.redirect('/uploads')
    })
});

module.exports = router;
