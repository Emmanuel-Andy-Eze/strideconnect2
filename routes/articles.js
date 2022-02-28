const router = require('express').Router();
const Article = require('../models/Article');
const User = require('../models/User')
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const { htmlToText } = require('html-to-text');
var { Remarkable } = require('remarkable');
const Comment = require("../models/Comment")

var md = new Remarkable({
    html: true, // Enable HTML tags in source
    xhtmlOut: false, // Use '/' to close single tags (<br />)
    breaks: false, // Convert '\n' in paragraphs into <br>
    linkify: false, // Autoconvert URL-like text to links

    // Enable some language-neutral replacement + quotes beautification
    typographer: false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’'
});

//Create an Article
router.post('/', async (req, res) => {
    const newArticle = new Article(req.body);
    try {
        const savedArticle = await newArticle.save();
        res.status(200).redirect('/articles');
    } catch (err) {
        res.status(500).json(err);
    }
})

//Get Create Page
router.get('/new', ensureAuth, (req, res) => {
    res.render('createArticle',
        {
            title: 'New Article | Stride Connect',
            user: req.user
        }
    )
})

//Update an Article
router.put('/:id', async (req, res) => {
    try {
        const article = Article.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
        console.log(article)
    } catch (err) {
        res.status(500).json(err);
    }
    
})

//Delete an Article
router.delete('/:id', async (req, res) => {
    try {
        Article.findByIdAndRemove(req.params.id, (err, doc) => {
            if (!err) {
                res.status(200).redirect('/articles')
            } else {
                console.log('Failed to Delete Article: ' + err);
            }
        })
    } catch (err) {
        res.status(500).json(err);
    }
})

//Like an Article
router.put('/:id/like', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
        if (!article.likes.includes(req.body.userId)) {
            await article.updateOne({ $push: { likes: req.body.userId } })
            res.status(200).redirect(`/articles/${article.slug}`)
        } else {
            await article.updateOne({ $pull: { likes: req.body.userId } })
            res.status(200).redirect(`/articles/${article.slug}`)
        }
    } catch (err) {
        res.status(500).json(err)
    }
})

//Get an Article
router.get('/:slug', async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug }).populate('user').lean()
        const articleBody = md.render(`${article.body}`)
        const comments = await Comment.find({ article: article._id }).populate('user').lean()

        res.render('singleArticle', {
            article,
            articleBody: htmlToText(articleBody),
            user: req.user,
            url: `https://strideconnect.herokuapp.com/articles/${article.slug}`,
            title: `${article.title} | Stride Connect`,
            comments
        })

        console.log(comments)
        // res.status(200).json(article)

      } catch (err) {
        console.error(err)
        res.render('error/404')
      }
})

router.post('/:id/comment', async (req, res) => {
    // find out which post you are commenting
    const id = req.params.id;
    // get the comment text and record post id
    const comment = new Comment(req.body);
    // save comment
    await comment.save();
    // get this particular post
    const articleRelated = await Article.findById(id);
    // push the comment into the post.comments array
    articleRelated.comments.push(comment);
    // save and redirect...
    await articleRelated.save(function (err) {
        if (err) { console.log(err) }
        res.redirect(`/articles/${articleRelated.slug}`)
    })
})

module.exports = router