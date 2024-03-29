const express = require('express')
const router = express.Router()
const { getUsdaRecall } = require('../controllers/usdaController')

router.get('/', getUsdaRecall)

module.exports = router