const bcrypt = require('bcrypt');
const run = require('../config/mongo_connection');
const getcollection = require("../config/collections");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const crypto=require("crypto")
const mailer=require("nodemailer")
module.exports = {
    doSignup: async (req, res) => {
        const collection = await getcollection();
        try {
            const userdata = req.body;
            const emailexists = await collection.usercollection.findOne({ email: userdata.email });

            if (emailexists) {
                res.status(400).json({ message: 'Email already exists' });
            } else {
                const hashedPassword = await bcrypt.hash(userdata.password, 10);

                const user = {
                    name: userdata.name,
                    bio: userdata.bio,
                    email: userdata.email,
                    password: hashedPassword
                };

                const result = await collection.usercollection.insertOne(user);
                console.log(result);
                res.status(200).json({ message: 'User successfully created.' });
            }
        } catch (error) {
            console.error('Error during signup:', error);
            res.status(500).json({ error: 'Internal Server Error' });
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
        const collection = await getcollection();
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
                            token:token
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
    const collection = await getcollection()
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
            throw new Error("user not found")

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
    const collection = await getcollection();

    try {
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const user = await collection.usercollection.findOne({ resettoken: token });
        console.log(user);
        console.log(newpassword);

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
}


};
