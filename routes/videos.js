const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const User = require('../models/User')

// @desc    Dashboard page
// @route   GET /dashboard
router.get('/', async (req, res) => {
    res.render('videos', {
        title: 'Videos | Stride Connect',
        user: req.user
    })
})

router.get('/:id', async(req, res) => {
    res.render('singleVideo', {
        title: 'Testing Video | Stride Connect',
        user: req.user
    })
})

    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

module.exports = router