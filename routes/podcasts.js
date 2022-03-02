const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const User = require('../models/User')
const Podcasts = require('../models/Podcast')
const path = require("path")
const fs = require("fs")
const multer = require("multer")
const cloudinary = require('../config/cloudinaryConfig')
const Comments = require('../models/Comment')

const storage = multer.diskStorage({
        filename: (req, file, cb) => {
          const fileExt = file.originalname.split(".").pop();
          const filename = `${new Date().getTime()}.${fileExt}`;
          cb(null, filename);
        }
      });

  // Filter the file to validate if it meets the required video extension
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === "audio/mp3" || file.mimetype === "audio/mpeg") {
      cb(null, true);
    } else { 
      cb(
        {
          message: "Unsupported File Format",
        },
        false
      );
    }
  };

  const upload = multer({
    storage,
    limits: {
      fieldNameSize: 200,
      fileSize: 30 * 1024 * 1024,
    },
    fileFilter,
  }).single("audio");

// @desc    Dashboard page
// @route   GET /dashboard
router.get('/', async (req, res) => {
    if(req.query.search) {
            try {
                const regex = new RegExp(escapeRegex(req.query.search), 'gi');
                const sortedTimelinePodcasts = await Podcasts.find({$or:[{category:{'$regex':req.query.search}}, {title:{'$regex':req.query.search}}]}).populate('user').lean().sort({ createdAt: 'desc' })
                res.render("podcasts", {
                    user: req.user,
                    sortedTimelinePodcasts,
                    title: 'Podcasts | Stride Connect'
                })
            } catch (err) {
                console.error(err)
            }
        } else {
            try {
                const sortedTimelinePodcasts = await Podcasts.find().populate('user').lean().sort({ createdAt: 'desc' })
                res.render("podcasts", {
                    user: req.user,
                    sortedTimelinePodcasts,
                    title: 'Podcasts | Stride Connect'
                })
            } catch (err) {
                console.error(err)
            }
        }
})

    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

router.get('/create', (req, res) => {
    res.render('createPodcast', {
        title: 'Create Podcast | Stride Connect',
        user: req.user
    })
})

router.get('/:id', async (req, res) => {
    try {
        const audio = await Podcasts.findById(req.params.id).populate('user').lean()
        const comments = await Comments.find({ audio: audio._id }).populate('user').lean()

        res.render('singlePodcast', {
            audio,
            user: req.user,
            url: `https://strideconnect.herokuapp.com/podcasts/${audio.slug}`,
            title: `${audio.title} | Stride Connect`,
            comments
        })

        console.log(comments)
        // res.status(200).json(article)

      } catch (err) {
        console.error(err)
        res.render('error/404')
      }
})

//POST new post
router.post('/create', upload, async (req, res) => {
    const { path } = req.file; // file becomes available in req at this point

    const fName = req.file.originalname.split(".")[0];
    cloudinary.uploader.upload_large(
      path,
      {
        resource_type: "raw",
        public_id: `AudioUploads/${fName}`,
        chunk_size: 6000000
      },

      // Send cloudinary response or catch error
      async(err, audio) => {
        if (err) return res.send(err);

        fs.unlinkSync(path);
        const result = audio.secure_url;
        // req.body.user = req.user.id
        const newPodcast = new Podcasts({
            body: req.body.body,
            title: req.body.title,
            category: req.body.category,
            created: req.body.created,
            audio: result,
            user: req.body.user
        }); 
    
          await newPodcast.save()
          res.redirect('/podcasts')
        })
      }
    );





module.exports = router