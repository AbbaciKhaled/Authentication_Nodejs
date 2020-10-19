require("dotenv").config();

const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const { sign, verify } = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../../models/User");

// EMAIL, PASSWORD REGEX
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

//to send verification email
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

module.exports = {
    createUser: (req, res) => {
        const body = req.body;

        //Vérifier si tous les champs sont bien remplis
        if (body.username == null || body.email == null || body.last_name == null || body.first_name == null || body.password == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        //Vérifier si l'email est valide
        if (!EMAIL_REGEX.test(body.email)) {
            return res.status(400).json({ 'error': 'email is not valid' });
        }

        //Vérifier si le mot de passe est valide
        if (!PASSWORD_REGEX.test(body.password)) {
            return res.status(400).json({ 'error': 'The password must contain at least: 8 characters, 1 capital letter, 1 number and 1 special character!' });
        }

        /*
        if (body.password != body.password_confirmation) {
            return res.status(400).json({ 'error': 'The password confirmation is different' });
        }*/

        //Hash password
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);

        //Vérifier si l'email existe déja
        User.findOne({
            attributes: ['email'],
            where: { email: body.email }
        })
            .then(function (user) {
                if (user)
                    return res.status(409).json({ 'error': 'user email already exist' });
                //Vérifier si l'username existe déja
                User.findOne({
                    attributes: ['username'],
                    where: { username: body.username }
                })
                    .then(function (user) {
                        if (user)
                            return res.status(409).json({ 'error': 'username already exist' });
                        var user = body;
                        const jsontoken = sign({ user }, process.env.JWT_ACC_ACTIVATE, {
                            expiresIn: "1h"
                        });

                        //Add user
                        User.create({
                            username: body.username,
                            email: body.email,
                            last_name: body.last_name,
                            first_name: body.first_name,
                            password: body.password
                        })
                            .then(function (user) {
                                if (user) {
                                    //Send verification email
                                    transporter.sendMail({
                                        from: process.env.MAIL_USER,
                                        to: user.email,
                                        subject: 'Account validation',
                                        html: `
                            <a href='${process.env.CLIENT_URL}/authentication/activate/${jsontoken}'>${process.env.CLIENT_URL}/authentication/activate/${jsontoken}</a>
                            `
                                    });
                                    return res.status(201).json({
                                        user
                                    });
                                } else {
                                    return res.status(500).json({ 'error 500': 'cannot add user' });
                                }

                            })
                            .catch(function (err) {
                                return res.status(500).json({ 'error 500': 'cannot add user' });
                            });
                    })
                    .catch(function (err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });

            })
            .catch(function (err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
            });
    },
    sendVerificationEmail: (req, res) => {
        User.findOne({
            where: { id: +req.params.id }
        })
            .then(function (user) {
                if (!user) {
                    return res.status(409).json({ 'error': 'user not exist' });
                }
                const jsontoken = sign({ user }, process.env.JWT_ACC_ACTIVATE, {
                    expiresIn: "1h"
                });
                //send email
                transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: user.email,
                    subject: 'Account validation',
                    html: `
                            <a href='${process.env.CLIENT_URL}/authentication/activate/${jsontoken}'>${process.env.CLIENT_URL}/authentication/activate/${jsontoken}</a>
                            `
                });
                return res.status(200).json({ 'message': 'the verification email has been sent' });
            })
            .catch(function (err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
            });

    },
    activateAccount: (req, res) => {
        let token = req.headers['x-access-token'] || req.headers['authorization'];
        if (token.startsWith('Bearer '))
            token = token.slice(7, token.length).trimLeft();
        const user_email = verify(token, process.env.JWT_ACC_ACTIVATE).user.email;

        User.findOne({
            where: { email: user_email }
        })
            .then(function (user) {
                if (user) {
                    user.update(
                        {
                            email_confirmation: true
                        }
                    )
                    return res.status(200).json({ 'message': 'the user account is activated' });
                }
                else {
                    return res.status(409).json({ 'error': 'user account not exist' });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ 'error': 'unable to activate user account' });
            });

    },
    sendResetPasswordEmail: (req, res) => {
        User.findOne({
            where: { id: +req.params.id }
        })
            .then(function (user) {
                if (!user) {
                    return res.status(409).json({ 'error': 'user not exist' });
                }
                const jsontoken = sign({ user }, process.env.JWT_RESET_PASS, {
                    expiresIn: "1h"
                });
                //send email
                transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: user.email,
                    subject: 'Reset password',
                    html: `
                            <a href='${process.env.CLIENT_URL}/password/reset/${jsontoken}'>${process.env.CLIENT_URL}/password/reset/${jsontoken}</a>
                            `
                });
                return res.status(200).json({ 'message': 'the reset password email has been sent' });
            })
            .catch(function (err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
            });
    },
    resetPassword: (req, res) => {
        let token = req.headers['x-access-token'] || req.headers['authorization'];
        if (token.startsWith('Bearer '))
            token = token.slice(7, token.length).trimLeft();
        const body = verify(token, process.env.JWT_RESET_PASS).user;

        if (!PASSWORD_REGEX.test(body.password)) {
            return res.status(400).json({ 'error': 'The password must contain at least: 8 characters, 1 capital letter, 1 number and 1 special character!' });
        }

        /*
        if (body.password != body.password_confirmation) {
            return res.status(400).json({ 'error': 'The password confirmation is different' });
        }*/

        User.findOne({
            where: { email: body.email }
        })
            .then(function (user) {
                if (user) {

                    //Hash password
                    const salt = genSaltSync(10);
                    const password = hashSync(req.body.password, salt);
                    user.update(
                        {
                            password: password
                        }
                    )
                    return res.status(200).json(user);
                }
                else {
                    return res.status(409).json({ 'error': 'user account not exist' });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ 'error': 'unable to activate user account' });
            });
    },
    login: (req, res) => {
        const body = req.body;
        if (body.email) { //get user by email        
            User.findOne({
                where: { email: body.email }
            })
                .then(function (user) {
                    if (user) {
                        if (user.google_id) //if this account has been created with google authentication
                            return res.status(409).json({ 'error': 'user account not exist' });
                        return module.exports.verifyAuthenticationInformation(user.dataValues, body.password, res)
                    } else {
                        return res.status(409).json({ 'error': 'user account not exist' });
                    }
                })
                .catch(function (err) {
                    return res.status(500).json({ 'error 500': 'cannot get user' });
                });
        } else if (body.username) { //get user by email
            User.findOne({
                where: { username: body.username }
            })
                .then(function (user) {
                    if (user) {
                        return module.exports.verifyAuthenticationInformation(user.dataValues, body.password, res)
                    } else {
                        return res.status(409).json({ 'error': 'user account not exist' });
                    }
                })
                .catch(function (err) {
                    return res.status(500).json({ 'error 500': 'cannot get user' });
                });
        }

    },
    verifyAuthenticationInformation: (user, password, res) => {
        //Compare password
        if (!compareSync(password, user.password))
            return res.status(409).json({ 'error': 'invalid password' });

        if (!user.email_confirmation)
            return res.status(409).json({ 'error': 'you must confirm your email' });

        user.password = undefined;
        const jsontoken = sign({ result: user }, process.env.JWT_KEY, {
            expiresIn: "1h"
        });

        return res.status(200).json({
            token: jsontoken,
            user
        });
    },
    getUserByUserId: (req, res) => {
        User.findOne({
            where: { id: req.params.id }
        })
            .then(function (user) {
                if (user) {
                    return res.status(200).json(user);
                }
                else {
                    return res.status(409).json({ 'error': 'user not exist' });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
            });
    },
    getUsers: (req, res) => {
        User.findAll({
        })
            .then(function (users) {
                if (users) {
                    return res.status(200).json(users);
                }
                else {
                    return res.status(409).json({ 'error': 'users not exist' });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
            });
    },
    updateUsers: (req, res) => {

        const body = req.body;
        User.findOne({
            where: { id: req.params.id }
        })
            .then(function (user) {
                if (user) {
                    user.update(
                        {
                            username: body.username,
                            email: body.email,
                            last_name: body.last_name,
                            first_name: body.first_name,
                            password: body.password
                        }
                    )
                    return res.status(200).json(user);
                }
                else {
                    return res.status(409).json({ 'error': 'user not exist' });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
            });

    },
    deleteUser: (req, res) => {
        User.destroy({
            where: { id: req.params.id }
        })
            .then(function (user) {
                if (user) {
                    return res.status(200).json(user);
                }
                else {
                    return res.status(409).json({ 'error': 'user not exist' });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ 'error': 'unable to delete user' });
            });
    }
};
