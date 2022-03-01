const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const User = require('../models/User')
const Videos = require('../models/Video')
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
    if (file.mimetype === "video/mp4") {
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
  }).single("video");

// @desc    Dashboard page
// @route   GET /dashboard
router.get('/', async (req, res) => {
    if(req.query.search) {
            try {
                const regex = new RegExp(escapeRegex(req.query.search), 'gi');
                const sortedTimelineVideos = await Videos.find({$or:[{category:{'$regex':req.query.search}}, {title:{'$regex':req.query.search}}]}).populate('user').lean().sort({ createdAt: 'desc' })
                res.render("videos", {
                    user: req.user,
                    sortedTimelineVideos,
                    title: 'Videos | Stride Connect'
                })
            } catch (err) {
                console.error(err)
            }
        } else {
            try {
                const sortedTimelineVideos = await Videos.find().populate('user').lean().sort({ createdAt: 'desc' })
                res.render("videos", {
                    user: req.user,
                    sortedTimelineVideos,
                    title: 'Videos | Stride Connect'
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
    res.render('createVideo', {
        title: 'Create Video | Stride Connect',
        user: req.user
    })
})

router.get('/:id', async (req, res) => {
    try {
        const video = await Videos.findById(req.params.id).populate('user').lean()
        const comments = await Comments.find({ video: video._id }).populate('user').lean()

        res.render('singleVideo', {
            video,
            user: req.user,
            url: `https://strideconnect.herokuapp.com/videos/${video.slug}`,
            title: `${video.title} | Stride Connect`,
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
    cloudinary.uploader.upload(
      path,
      {
        resource_type: "video",
        public_id: `VideoUploads/${fName}`,
        chunk_size: 6000000
      },

      // Send cloudinary response or catch error
      async(err, video) => {
        if (err) return res.send(err);

        fs.unlinkSync(path);
        const result = video.secure_url;
        // req.body.user = req.user.id
        const newVideo = new Videos({
            body: req.body.body,
            title: req.body.title,
            category: req.body.category,
            created: req.body.created,
            video: result,
            user: req.body.user
        }); 
    
          await newVideo.save()
          res.redirect('/videos')
        })
      }
    );





module.exports = router