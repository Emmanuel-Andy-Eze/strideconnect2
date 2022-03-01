const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const User = require('../models/User')
const Article = require('../models/Article')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login')
})

// @desc    Dashboard page
// @route   GET /dashboard
router.get('/articles', async (req, res) => {
    if(req.query.search) {
            try {
                const regex = new RegExp(escapeRegex(req.query.search), 'gi');
                const sortedTimelineArticles = await Article.find({$or:[{category:{'$regex':req.query.search}}, {title:{'$regex':req.query.search}}]}).populate('user').lean().sort({ createdAt: 'desc' })
                res.render("index", {
                    user: req.user,
                    sortedTimelineArticles,
                    title: 'Articles | Stride Connect'
                })
            } catch (err) {
                console.error(err)
            }
        } else {
            try {
                const sortedTimelineArticles = await Article.find().populate('user').lean().sort({ createdAt: 'desc' })
                res.render("articles", {
                    user: req.user,
                    sortedTimelineArticles,
                    title: 'Articles | Stride Connect'
                })
            } catch (err) {
                console.error(err)
            }
        }
})

    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };


router.get('/creator', ensureAuth, (req, res) => {
        res.status(200).render('creator', {
            user: req.user,
            title: `Creator Mode | Stride Connect`,
        });
})

module.exports = router