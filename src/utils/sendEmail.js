require('dotenv').config()

const nodemailer = require("nodemailer");

const {host, port, user, pass} = require('./mail.json')

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            auth: {
                user,
                pass,
            },
        });

        await transporter.sendMail({
            from: user,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("email enviado com sucesso");
    } catch (error) {
        console.log(error, "email não enviado");
    }
};

module.exports = sendEmail;