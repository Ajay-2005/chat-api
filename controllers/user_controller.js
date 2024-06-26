const bcrypt = require('bcrypt');
const run = require('../config/mongo_connection');
const getcollection = require("../config/collections");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const crypto = require("crypto")
const mailer = require("nodemailer")
const speakeasy = require("speakeasy");
const collections = require('../config/collections');
const { ObjectId } = require("mongodb")
const collection = getcollection()
module.exports = {
    generatesecert: () => {
        return speakeasy.generateSecret({ length: 6, name: "chatapi" })
    },
    generateOtp: (secret) => {
        return speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32'
        })
    },
    /**
 * Verifies the provided token against the secret.
 * @param {object} secret - The secret object generated for the user.
 * @param {string} token - The token to be verified.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
    verifytoken: (secret, token) => {
        return speakeasy.totp.verify({
            secret: secret.base32,
            encoding: 'base32',
            token: token,
            window: 1,

        })
    },

    sendOTPEmail: async (email, otp) => {
        try {
            const transport = mailer.createTransport({
                service: process.env.EMAIL_SERVICE,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const mailoptions = {
                from: process.env.EMAIL_USERNAME,
                to: email,
                subject: 'One Time Password (OTP)',
                text: `Your OTP is: ${otp}`
            };

            const info = await transport.sendMail(mailoptions);
            console.log("Email sent", info.response);
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    doSignup: async (req, res) => {


        try {
            const userdata = req.body;
            const emailexists = await collection.usercollection.findOne({ email: userdata.email });

            if (emailexists) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const secret = module.exports.generatesecert();
            const otp = module.exports.generateOtp(secret);


            try {
                await module.exports.sendOTPEmail(userdata.email, otp);
            } catch (error) {
                console.log("Error during sending OTP:", error);
                return res.status(500).json({ error: 'Internal server error' });
            }


            const hashedPassword = await bcrypt.hash(userdata.password, 10);
            const user = {
                name: userdata.name,
                bio: userdata.bio,
                email: userdata.email,
                password: hashedPassword,
                otp: otp,
                isVerified: false
            };
            await collection.usercollection.insertOne(user);
            res.status(200).json({ message: 'User successfully created.' });
        } catch (error) {
            console.error('Error during signup:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    otpVerifyDuringSignup: async (req, res) => {
        try {
            const data = req.body;

            const user = await collection.usercollection.findOne({ email: data.email });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            if (data.otp === user.otp) {
                await collection.usercollection.updateOne({ "email": user.email }, {
                    $set: { "isVerified": true }

                })
                return res.json("OTP verified successfully");

            } else {
                return res.json("Invalid OTP token");
            }
        } catch (error) {
            console.error('Error during OTP verification:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    generateToken: (user) => {
        try {
            const token = jwt.sign({ username: user.name, useremail: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return token;
        } catch (error) {
            console.error('Error generating token:', error);
            throw error;
        }
    },

    dologin: async (req, res) => {

        try {
            const { email, password } = req.body;
            const userExist = await collection.usercollection.findOne({ email: email });

            if (!userExist) {
                res.status(404).json({ message: "User not found" });
            } else {
                bcrypt.compare(password, userExist.password).then((status) => {
                    if (status) {
                        const token = module.exports.generateToken(userExist);
                        console.log('Generated Token:', token);

                        const user = {
                            name: userExist.name,
                            bio: userExist.bio,
                            email: userExist.email,
                            token: token
                        };
                        res.status(200).json({ message: 'Login successfully', user: user });
                    } else {
                        res.status(401).json({ message: 'Login failed' });
                    }
                });
            }
        } catch (error) {
            console.error('Error during login', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    generateResetToken: () => {
        try {
            const token = crypto.randomBytes(32).toString('hex');
            return token;
        } catch (error) {
            console.error('Error generating reset token:', error);
            throw error;
        }
    },


    updateUserResettoken: async (email, token) => {

        try {
            const user = await collection.usercollection.findOne({ email: email })
            const result = await collection.usercollection.findOneAndUpdate(
                { email: { $eq: email } },
                { $set: { resettoken: token } }

            )
            if (result) {
                return result
            }
            else {
                return null

            }
        } catch (error) {
            console.log(error)
        }
    },
    sendEmailResetlink: async (email, resetlink) => {
        try {
            const transport = mailer.createTransport({
                service: process.env.EMAIL_SERVICE,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            })
            const mailoptions = {
                from: process.env.EMAIL_USERNAME,
                to: email,
                subject: 'Password reset',
                html: `<p>You have requested a password reset. Click the following link to reset your password:</p><a href="${resetlink}">${resetlink}</a>`
            }
            const info = await transport.sendMail(mailoptions)
            console.log("Email sent", info.response)
        }
        catch (error) {
            console.log(error)
            throw error
        }
    },
    sendResetlink: async (req, res) => {
        const email = req.body.email;
        try {
            const token = module.exports.generateResetToken();
            const result = await module.exports.updateUserResettoken(email, token);
            const resetLink = `http://127.0.0.1:5000/resetpassword?token=${token}`;
            await module.exports.sendEmailResetlink(email, resetLink);
            res.status(200).json({ message: 'Reset link sent successfully', token });
        } catch (error) {
            console.error('Error in forgotPassword:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    resetPassword: async (req, res) => {
        const token = req.query.token;
        const newpassword = req.body.newpassword


        try {
            if (!token) {
                return res.status(400).json({ error: 'Token is required' });
            }

            const user = await collection.usercollection.findOne({ resettoken: token });
            console.log(user);


            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired token' });
            }

            const hashedPassword = await bcrypt.hash(newpassword, 10);
            const result = await collection.usercollection.updateOne(
                { email: user.email },
                { $set: { password: hashedPassword, resettoken: null } }
            );

            console.log(result);

            if (result.modifiedCount > 0) {
                return res.status(200).json({ message: 'Password reset successfully' });
            } else {
                throw new Error('Failed to update password');
            }
        } catch (error) {
            console.error('Error in resetPassword:', error);
            res.status(500).json({ error: 'Internal server error during password reset. Please try again later.' });
        }
    },
    getAllusers: async (req, res) => {

        const users = await collections.usercollection.find().toArray()
        res.json(users)
    },
    getUserById: async (req, res) => {
        try {

            const id = req.params.id;

            const user = await collections.usercollection.findOne({ _id: id });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(user);
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }







};
