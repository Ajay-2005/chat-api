const bcrypt = require('bcrypt');

const run = require('../config/mongo_connection');
const getcollection = require("../config/collections")

module.exports = {
    doSignup: async (req, res) => {
        const collection = await getcollection()
        try {
            const userdata = req.body;
            const emailexists = await collection.usercollection.findOne({ email: userdata.email })
            if (emailexists) {
                console.log(emailexists)
                res.json({ message: 'Email already exists' })
            }
            else {
                const hashedPassword = await bcrypt.hash(userdata.password, 10);

                const user = {
                    "name": userdata.name,
                    "bio": userdata.bio,
                    "email": userdata.email,
                    "password": hashedPassword
                };


                const result = await collection.usercollection.insertOne(user)
                console.log(result)
                res.status(200).json({ message: 'User successfully created.' });

            }
        } catch (error) {
            console.error('Error during signup:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    dologin: async (req, res) => {
        const collection = await getcollection();
        try {
            const { email, password } = req.body;
            const user = await collection.usercollection.findOne({ email: email });

            if (!user) {
                res.status(404).json({ message: "User not found" });
            } else {
                bcrypt.compare(password, user.password).then((status) => {
                    if (status) {
                      
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
    }


};