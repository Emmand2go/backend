import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config();

const sendReset = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`, // custom sender
    to,
    subject,
    html
  });
};

export default sendReset;