const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //1)create a transporterver
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '206c67505006c6',
      pass: '737795a83059e1'
    }
  });

  //2)define email o ptions
  const mailOptions = {
    from: 'Amit Edri <Amitedrie@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //html:
  };

  //3)Actually send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
