const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const marked = require('marked');
const slugify = require('slugify');
const dompurify = createDomPurify(new JSDOM().window);

const Notes = new Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    slug: {
        type: String,
        unique: false,
        required: true,
    },
    sanitizedHtml: {
        type: String,
        required: true
    }
});

Notes.pre('validate', function(next){
    if(this.title){
        this.slug = slugify(this.title, {lower: true, strict: true})
    }

    if(this.text){
        this.sanitizedHtml = dompurify.sanitize(marked(this.text));
    }
    next()
});

Notes.pre('update', function(next){
    if(this.text){
        this.sanitizedHtml = dompurify.sanitize(marked(this.text))
    }

    next()
})

module.exports = Note = mongoose.model('Notes', Notes);