const axios = require("axios");
const express = require("express");
const dotenv = require("dotenv").config();
const { errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const connectDB = require("./config/db");
//const port = process.env.PORT|| 8000
const port = 8000;
const cors = require("cors");
const cron = require("node-cron");
const moment = require("moment-timezone");
const timezone = "Africa/Kampala";
const sendEmail = require('./utils/sendEmail')

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
  })
);

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/fda", require("./routes/fdaRoutes"));


// Check for new recalls from the fda website
cron.schedule(
  "51 03 * * *",
  async (req, res) => {
    const now = moment().tz(timezone);
    const currentDate = new Date()
    const today = (currentDate.toJSON().slice(0,8)+currentDate.toJSON().slice(8, 10)).split('-').join('')
    Date.prototype.subtractDay = function (days) {
      this.setTime(this.getTime()-(days * 24 * 60 * 60 *1000))
      return this
    }
    const yesterdayDate = currentDate.subtractDay(1)
    const yesterday = (yesterdayDate.toJSON().slice(0,8)+yesterdayDate.toJSON().slice(8, 10)).split('-').join('')
    if (now.hour() === 3 && now.minute() === 51) {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api.fda.gov/food/enforcement.json?search=report_date:[20240326+TO+20240327]&limit=5`,
        //url: `https://api.fda.gov/food/enforcement.json?search=report_date:[${yesterday}+TO+${today}]&limit=1000`,
        headers: {},
      };

      try {
        const response = await axios.request(config);
        const data = await response.data.results;
        const link = `http://localhost:3000/`;
          sendEmail(
            "denismoini09@gmail.com",
            "Recalls as reported by the FDA for the past 24 hours",
            { data: data,  link: link},
            "./templates/fdaRecalls.handlebars"
          );
        
        res.status(200).json(data);
      } catch (error) {
        console.log(error.response.status);
        console.log(error.response.statusText);
      }
    }
  },
  {
    timezone,
  }
);

// Check for new recalls from the usda website
app.use("/api/usda", require("./routes/usdaRoutes"));

app.listen(port, console.log(`Server running at port: ${port}`));
