const nodemailer = require("nodemailer");
require('dotenv').config();

module.exports = function sendToGmail(message){
    const {google} = require('googleapis');
    const OAuth2 = google.auth.OAuth2;
    console.log("CLIENT_ID");
    console.log(process.env.CLIENT_ID);
    console.log("SECRET");
    console.log(process.env.CLIENT_SECRET);
    console.log("RT");
    console.log(process.env.GMAIL_REFRESH_TOKEN);
    console.log(message);
   
    const OAuth2Client = new OAuth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET);
    
    OAuth2Client.setCredentials({
        refresh_token : process.env.GMAIL_REFRESH_TOKEN,
        expires_in : 31536000
    });
    
    
    const ACCESS_TOKEN = OAuth2Client.getAccessToken();
    
      const transport = nodemailer.createTransport({
        service : "gmail",
        auth : {
          type : "OAuth2",
          user : process.env.GMAIL_USER,
          clientId : process.env.CLIENT_ID,
          clientSecret : process.env.CLIENT_SECRET,
          refreshToken : process.env.GMAIL_REFRESH_TOKEN,
          accessToken : ACCESS_TOKEN,
        },
        tls : {rejectUnauthorized : false}
      });
    
      var mailOptions = {
        to: process.env.EMAIL,
        replyTo : message.email,
        subject: message.object,
        html: `<h4>${message.fName} ${message.lName}</h4> <h4>${message.phone}</h4> <p>${message.message}</p>`,
        // generateTextFromHTML: true,
      };
      console.log("mail option");
      console.log("==================================");

      console.log(mailOptions);
      
    transport.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    
};





