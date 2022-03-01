 const mongoose = require('mongoose');
const User = require('./User')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurifier = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurifier(new JSDOM().window)

const Schema = mongoose.Schema

const VideoSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    title: {
        type: String,
    },
    category: {
        type: String,
    },
    body: {
        type: String,
    },
    video: String,
    likes: {
        type: Array,
        default: [],
    },
    slug: {
        type: String,
        required: true
    }, 
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
},
    {timestamps: true}
)

VideoSchema.pre('validate', function(next) {
    if (this.title) {
        this.slug = slugify(this.title, {lower: true, strict: true})
    }


    next()
})

module.exports = mongoose.model('Video', VideoSchema) 

