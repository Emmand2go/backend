// import dotenv from "dotenv"
// import SibApiV3Sdk from "sib-api-v3-sdk"
// dotenv.config();

// // const SibApiV3Sdk = require('sib-api-v3-sdk');
// // const apiKey = process.env.BREVO_API_KEY; // Store in .env
// // SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey;

// // Configure Brevo (Sendinblue) client
// const client = SibApiV3Sdk.ApiClient.instance;
// client.authentications["api-key"].apiKey = apiKey

// const sendOtpEmail = async (email, otp) => {
//     try {
//         const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
//         const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        
//         sendSmtpEmail.subject = "Your OTP Code";
//         sendSmtpEmail.htmlContent = `<html><body><h2>Your OTP Code: ${otp}</h2></body></html>`;
//         sendSmtpEmail.to = [{ email }];
        
//         const response = await tranEmailApi.sendTransacEmail(sendSmtpEmail);
//         return response;
//     } catch (error) {
//         console.error("Error sending OTP email:", error);
//         throw error;
//     }
// };

// module.exports = { sendOtpEmail };

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();


/**
 * Send OTP email via Brevo
 * @param {Object} param0 
 * @param {string} param0.Email - recipient email
 * @param {string} param0.otp - OTP code
 * @param {string} [param0.Name] - recipient name (optional)
 */

export const sendotpEmail = async ({ Email, Name, otp }={}) => {
     if (!Email || !otp) {
    throw new Error("Email and OTP are required to send email");
  }
    // const { Email,Name } = req.body;
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: "sender@brevo.com",
          name: "ND rep",
        },
        to: [
          {
            email: Email,
            name: Name || "User",  // from request
          },
        ],
        subject: "Your OTP Code",
        htmlContent: `
          <p>Hello ${Name || "there"},</p>
          <p>Your OTP is:</p>
          <h2>${otp}</h2>
          <p>This code will expire in 5 minutes.</p>
        `,
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
      }
    );

    console.log("Email sent:", response.data);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message
    );
    throw error;
  }
};

sendotpEmail();