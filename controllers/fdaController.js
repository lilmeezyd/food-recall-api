const axios = require('axios')
const asyncHandler = require('express-async-handler')

//@desc Get all fda recalls
//@route GETT /api/fda
//@access Public
const getRecalls = asyncHandler(async(req, res) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.fda.gov/food/enforcement.json?limit=1000',
        headers: { }
    }

    try {
        const response = await axios.request(config)
        const data = await response.data
        console.log(data)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
    }
})

module.exports = { getRecalls }