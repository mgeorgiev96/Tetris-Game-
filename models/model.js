const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {
        required: true,
        type: String
    },
    password:{
        required: true,
        type: String
    },
    thumbnail: String,
    name: String,
    scores: Array
})

const User = mongoose.model('tetris-user',UserSchema)

module.exports = User