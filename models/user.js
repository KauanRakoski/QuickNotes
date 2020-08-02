const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    googleID: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
    },
});

module.exports = User = mongoose.model('User', UserSchema);