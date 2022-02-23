const express = require('express')
const passport = require('passport')
const router = express.Router()

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile', // get user info
    'https://www.googleapis.com/auth/userinfo.email'
  ]
}))

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/google/cb',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/articles')
  }
)

// @desc    Logout user
// @route   /auth/logout
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router