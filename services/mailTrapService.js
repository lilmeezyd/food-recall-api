const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,
    auth: {
      user: "api",
      pass: "9acd1804b60cd72f2a258ff99c052136"
    }
  });

const mailOptions = {
    from: "",
    to: "",
    subject: "",
    text: ""
}

const sender = {
    email: "mailtrap@demomailtrap.com",
    name: "Mailtrap Test",
  };
  const recipients = [
    {
      email: "denismoini09@gmail.com",
    }
  ];

exports.sendMail = async (req, res) => {
    const { subject, text} = req.body

    mailOptions.from = sender.email
    mailOptions.to = recipients[0].email
    mailOptions.subject = subject
    mailOptions.text = text

    try {
        const result = await transporter.sendMail(mailOptions)
        console.log(result)
        return result
    } catch (error) {
        return error
    }
}