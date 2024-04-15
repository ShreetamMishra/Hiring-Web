import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

import ENV from '../config.js';


// https://ethereal.email/create
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shreetammishra01@gmail.com',
        pass: 'rsfghymlzapvfbyh'
    }
});

let MailGenerator = new Mailgen({
    theme: "default",
    product : {
        name: "Jitu",
        link: 'http://localhost:3000/'
    }
})

/** POST: http://localhost:8080/api/registerMail 
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/
export const registerMail = async (req, res) => {
    const { username, userEmail, text, subject } = req.body;

    // body of the email
    var email = {
        body : {
            name: username,
            intro : text || 'Welcome to Previous Year Quistion',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }

    var emailBody = MailGenerator.generate(email);

    let message = {
        from : ENV.EMAIL,
        to: userEmail,
        subject : subject || "Signup Successful",
        html : emailBody
    }

    // send mail
    transporter.sendMail(message)
        .then(() => {
            return res.status(200).send({ msg: "You should receive an email from us."})
        })
        .catch(error => res.status(500).send({ error }))

}
