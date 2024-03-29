const express = require('express')
const router = express.Router()
const { getRecalls } = require('../controllers/fdaController')

router.get('/', getRecalls)

module.exports = router