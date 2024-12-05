const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const { htmlToText } = require('html-to-text');

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const generateHTML = (options = {}) => {
    const html = pug.renderFile(
        `${__dirname}/../views/password-reset.pug`,
        options
    );
    
    const inlined = juice(html);
    return inlined;
};

//exportable method to send emails
exports.send = async (options) => {
    const html = generateHTML(options);
    const text = htmlToText(html);
    const mailOptions = {
        from: 'Alex <alex@gmail.com>',
        to: options.user.email,
        subject: options.subject,
        html: html,
        text: text
    };
    
    await transport.sendMail(mailOptions);
};