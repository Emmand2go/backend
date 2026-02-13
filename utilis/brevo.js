// import dotenv from "dotenv"
// import SibApiV3Sdk from "sib-api-v3-sdk"
// dotenv.config();

// // const SibApiV3Sdk = require('sib-api-v3-sdk');
// const ApiKey = process.env.BREVO_API_KEY; // Store in .env
// // SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey;

// Configure Brevo (Sendinblue) client
// const client = SibApiV3Sdk.ApiClient.instance;
// client.authentications["api-key"].apiKey = ApiKey
// const brevoEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

//22 /**
//  * Send email using Brevo (Sendinblue)
//  * @param {string} to - Recipient email
//  * @param {string} subject - Subject line
//  * @param {string} htmlContent - HTML email body
//  * @param {string} name - Recipient name
//  */

// export const sendotpEmail = async (Email, otp) => {
//     try {
//         const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
//         const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        
//         sendSmtpEmail.subject = "Your OTP Code";
//         sendSmtpEmail.htmlContent = `<html><body><h2>Your OTP Code: ${otp}</h2></body></html>`;
//         sendSmtpEmail.to = [{ Email }];
        
//         const response = await tranEmailApi.sendTransacEmail(sendSmtpEmail);
//         return response;
//     } catch (error) {
//         console.error("Error sending OTP email:", error);
//         throw error;
//     }
// };


//22 export const sendEmail = async (Email,otp,) => {
//   try {
//     const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
//       sender: {
//         name: process.env.SENDER_NAME,
//         email: process.env.SENDER_EMAIL,
//       },
//       to: [{ email: Email }],
//       subject: "Your OTP Verification Code",
//       htmlContent: `
//         <h2>Email Verification</h2>
//         <p>Your OTP is:</p>
//         <h1>${otp}</h1>
//         <p>This code expires in 10 minutes.</p>
//       `,
//     });

//     const response = await brevoEmailApi.sendTransacEmail(sendSmtpEmail);
//     console.log("✅ Email sent successfully:", response);
//   } catch (error) {
//     console.error("❌ Email sending error:", error.response?.body || error);
//   }
// };


// module.exports = { sendotpEmail };

// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();


// /**
//  * Send OTP email via Brevo
//  * @param {Object} param0 
//  * @param {string} param0.Email - recipient email
//  * @param {string} param0.otp - OTP code
//  * @param {string} [param0.Name] - recipient name (optional)
//  */

// export const sendotpEmail = async ( Email,otp) => {
//      if (!Email || !otp) {
//     throw new Error("Email and OTP are required to send email");
//   }
//     // const { Email,Name } = req.body;
//   try {
//     const response = await axios.post(
//       "https://api.brevo.com/v3/smtp/email",
//       {
//         sender: {
//           email: "emmanuelndubuisi2010@gmail.com",
//           name: "ND rep",
//         },
//         to: [{ email:Email }],
//         subject: "Your OTP Verification Code",
//       htmlContent: `
//         <h2>Email Verification</h2>
//         <p>Your OTP is:</p>
//         <h1>${otp}</h1>
//         <p>This code expires in 10 minutes.</p>
//       `,
//       },
//       {
//         headers: {
//           accept: "application/json",
//           "content-type": "application/json",
//           "api-key": `${process.env.BREVO_API_KEY}`.trim(),
//         },
//       }
//     );

//     console.log("Email sent:", response.data);
//   } catch (error) {
//     console.error(
//       "Error sending email:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

import dotenv from "dotenv";
import Brevo from "@getbrevo/brevo";

dotenv.config();

// 1. Configure the GLOBAL client instance (This is the most reliable way)
// const defaultClient = Brevo.ApiClient.instance;
// const apiKey = defaultClient.authentications['api-key'];
// apiKey.apiKey = process.env.BREVO_API_KEY;
// // ✅ Setup Brevo client
const brevoEmailApi = new Brevo.TransactionalEmailsApi();
    brevoEmailApi.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

// // 2. Now create the API instance
// const brevoEmailApi = new Brevo.TransactionalEmailsApi();

/**
 * Send OTP email using Brevo
 * @param {string} Email - Recipient email
 * @param {string} otp - OTP code
 */
export const sendotpEmail = async (Email, otp) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    // Use fallback values if .env variables are missing
    sendSmtpEmail.sender = {
      name: process.env.SENDER_NAME || "ND Rep",
      email: process.env.SENDER_EMAIL || "emmanuelndubuisi2010@gmail.com",
    };

    sendSmtpEmail.to = [{ email: Email }];
    sendSmtpEmail.subject = "Your OTP Verification Code";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: sans-serif; text-align: center;">
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="color: #3498db;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;

    const response = await brevoEmailApi.sendTransacEmail(sendSmtpEmail);

    console.log("✅ Email sent successfully:", response.body);
    return response;

  } catch (error) {
    // Brevo SDK puts the detailed error inside error.response.body
    console.error("❌ Email sending error details:", error.response?.body || error.message);
    throw error;
  }
};