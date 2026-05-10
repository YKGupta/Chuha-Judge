import nodemailer from "nodemailer";

const SendMail = async (email, mailSubject, mailMessage) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: mailSubject,
        html: mailMessage,
    };

    await transporter.sendMail(mailOptions);
};

export default SendMail;
