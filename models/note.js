const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Notes = new Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        default: "Quick note"
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = Note = mongoose.model('Notes', Notes);