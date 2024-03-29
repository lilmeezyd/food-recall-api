const express = require('express')
const router = express.Router()
const mailTrapService = require('../services/mailTrapService')

router.post('/send-mailtrap', async (req, res) => {
    try {
        const response = await mailTrapService.sendMail(req, res)

        res.status(200).json({
            status: 'success',
            message: 'Email sent successfully',
            data: response
        })
    } catch (error) {
        console.log('error:', error)
        res.status(400).json({
            status: 'error',
            message: 'Email not sent'
        })
    }
})

module.exports = router