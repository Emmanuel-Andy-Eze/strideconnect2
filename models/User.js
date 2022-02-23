const mongoose = require('mongoose');
const marked = require('marked')
const slugify = require('slugify')

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    displayName: {
        type: String
    },
    email: {
        type: String,
    },
    image: {
        type: String,
        default: ''
    },
    coverPicture: {
        type: String,
        default: ''
    },
    followers: {
        type: Array,
        default: []
    },
    followings: {
        type: Array,
        default: []
    },
    isCreator: {
        type: Boolean,
        default: false
    },
    desc: {
        type: String,
    },
    field: {
        type: String,
    },
    slug: {
        type: String,
        required: true
    },
},
    {timestamps: true}
)

UserSchema.pre('validate', function(next) {
    if (this.displayName) {
        this.slug = slugify(this.displayName, {lower: true, strict: true})
    }


    next()
})

module.exports = mongoose.model('User', UserSchema)

