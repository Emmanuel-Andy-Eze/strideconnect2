const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Article = require('../models/Article')
const { ensureAuth, ensureGuest } = require('../middleware/auth')

//Update User
router.put('/:id', async(req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password){
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch(err) {
                return res.status(500).json(err)
            } 
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            })
            res.status(200).json('Account has been updated');
        } catch (err) {
            return res.status(500).json(err)
        }
    } else {
        return res.status(403).json('You can update only your account')
    }
})

//Delete User
router.delete('/:id', async(req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json('Account has been deleted');
        } catch (err) {
            return res.status(500).json(err)
        }
    } else {
        return res.status(403).json('You can delete only your account')
    }
})

//Get a User
router.get('/:id', async(req, res) => {
    try {
        const thisUser = await User.findById(req.params.id);
        const {password, updatedAt, ...other} = thisUser._doc
        const title = thisUser.displayName
        const articles = await Article.find({user: thisUser.id}).populate('user').sort({ createdAt: 'desc' })
        res.status(200).render('profile', {
            thisUser,
            user: req.user,
            title: `${title} | Stride Connect`,
            articles
        });
    } catch (err) {
        res.status(500).json(err);
    }
})

//Follow a User
router.post('/:id/follow', async(req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } })
                await currentUser.updateOne({ $push: { followings: req.params.id } })
                res.status(200).redirect(`/users/${req.params.id}`)
            } else {
                res.status(403).json('You already followed this user')
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json('You cannot follow yourself')
    }
})


//Unfollow a User
router.post('/:id/unfollow', async(req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } })
                await currentUser.updateOne({ $pull: { followings: req.params.id } })
                res.status(200).redirect(`/users/${req.params.id}`)
            } else {
                res.status(403).json('You dont follow this user')
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json('You cannot follow yourself')
    }
})

// Get Users
router.route('/').get(ensureAuth, (req, res) => {
    User.find((error, response) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(response)
        }
    })
})


module.exports = router