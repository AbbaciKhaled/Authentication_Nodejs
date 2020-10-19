const { sign } = require("jsonwebtoken");
const User = require("../../models/User");

const { google } = require('googleapis');
const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_AUTH_ID, process.env.GOOGLE_AUTH_SECRET, process.env.GOOGLE_AUTH_REDIRECT)

// used for request redirection 
var authed = null;

module.exports = {

    googleSignUp: (req, res) => {
        if (!authed) {
            authed = "signup";
            // Generate an OAuth URL and redirect there
            const url = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
            });
            res.redirect(url);
        } else {
            authed = null;
            var oauth2 = google.oauth2({
                auth: oAuth2Client,
                version: 'v2'
            });
            oauth2.userinfo.v2.me.get(
                function (err, res2) {
                    if (err) {
                        return res.status(500).json({ 'error': 'connection error' });
                    } else {
                        //Check if the user is already registered with this gmail
                        User.findOne({
                            attributes: ['google_id'],
                            where: { google_id: res2.data.id.toString() }
                        })
                            .then(function (user) {
                                if (user) {
                                    return res.status(409).json({ 'error': 'you already have an account with this gmail' });
                                }
                                else {
                                    //Add user
                                    var user = User.create({
                                        email: res2.data.email,
                                        last_name: res2.data.family_name,
                                        first_name: res2.data.given_name,
                                        email_confirmation: true,
                                        google_id: res2.data.id.toString()
                                    })
                                        .then(function (user) {
                                            if (user) {
                                                return res.status(201).json({
                                                    user
                                                });
                                            } else {
                                                return res.status(409).json({ 'error': 'cannot add user' });
                                            }

                                        })
                                        .catch(function (err) {
                                            return res.status(500).json({ 'error 500': 'cannot add user' });
                                        });
                                }
                            })
                            .catch(function (err) {
                                return res.status(500).json({ 'error': 'unable to verify user' });
                            });

                    }
                });
        }
    },
    googleLogin: (req, res) => {
        if (!authed) {
            authed = "login";
            // Generate an OAuth URL and redirect there
            const url = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
            });
            res.redirect(url);
        } else {
            authed = null;
            var oauth2 = google.oauth2({
                auth: oAuth2Client,
                version: 'v2'
            });
            oauth2.userinfo.v2.me.get(
                function (err, res2) {
                    if (err) {
                        return res.status(500).json({ 'error': 'connection error' });
                    } else {
                        //Check if the user is already registered with this gmail
                        User.findOne({
                            where: { google_id: res2.data.id.toString() }
                        })
                            .then(function (user) {
                                if (!user) {
                                    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
                                    return res.status(409).json({ 'error': 'you don\'t have an account with this gmail' });
                                }
                                else {
                                    const jsontoken = sign({ result: user }, "qwe1234", {
                                        expiresIn: "1h"
                                    });
                                    return res.status(200).json({
                                        token: jsontoken,
                                        user
                                    });
                                }
                            })
                            .catch(function (err) {
                                return res.status(500).json({ 'error': 'unable to verify user' });
                            });

                    }
                });
        }
    },
    googleCallBack: (req, res) => {
        const code = req.query.code
        if (code) {
            // Get an access token based on our OAuth code
            oAuth2Client.getToken(code, function (err, tokens) {
                if (err) {
                    console.log('Error authenticating')
                    console.log(err);
                } else {
                    oAuth2Client.setCredentials(tokens);
                    switch (authed) {
                        case 'signup': res.redirect('/google/signup'); break;
                        case 'login': res.redirect('/google/login'); break;
                    }

                }
            });
        }
    }
};