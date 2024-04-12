const axios = require('axios')
const asyncHandler = require('express-async-handler')

//@desc Get all usda recalls
//@route GETT /api/usda
//@access Public

const getUsdaRecall = asyncHandler(async(req, res) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://www.fsis.usda.gov/fsis/api/recall/v/1',
        headers: { }
    }
    try { 
        const response = await axios.request(config)
        const data = await response.data
        //console.log(data)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
    } 
})


module.exports = { getUsdaRecall }