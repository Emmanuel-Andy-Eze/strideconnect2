const mongoose = require('mongoose');

        const commentSchema = new mongoose.Schema({
         user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        text: {
              type: String,
              trim: true,
              required: true
           },
        date: {
              type: Date,
              default: Date.now
           },
       // each comment can only relates to one blog, so it's not in array
        article: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Article'
           }
         })

        module.exports = mongoose.model('Comment', commentSchema);