const mongoose = require('mongoose')

const recallSchema = mongoose.Schema({
    id:{
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    cause: {
        type: String,
        default: 'N/A'
    },
    website: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Recall', recallSchema)