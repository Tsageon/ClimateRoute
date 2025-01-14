const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/AuthM')

exports.registerUser = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already being used' });
        }


        const newUser = new User({
            email,
            password,
            username,
        })

        const SaltRounds = 10;
        newUser.password = await bcrypt.hash(password, SaltRounds);

        await newUser.save();
        console.log(newUser)

        res.status(201).json({
            message: 'Userinfo saved successfully',
            user: { email: newUser.email, username: newUser.username,  phonenumber: newUser.phonenumber }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found or you entered the wrong credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token
        });
        console.log(user.email,user.password,user.role)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while logging in user' });
    }
};

exports.logoutUser = (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            const userId = decoded.userId; 
            console.log(`User with ID: ${userId} logged out`);

            res.status(200).json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while logging out' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const saltRounds = 10;
        user.password = await bcrypt.hash(password, saltRounds);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while resetting the password' });
    }
};

exports.getUser = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }
        res.status(200).json({
            email: user.email,
            phonenumber: user.phonenumber,
            fullname: user.fullname,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while fetching the user profile' });
    }
};


exports.updateUser = [
    authMiddleware,
    async (req, res) => {
        const userId = req.userId;
        const { email, password, username, phonenumber } = req.body;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user._id.toString() !== userId) {
                return res.status(403).json({ message: 'You can only update your own profile' });
            }

            if (email) user.email = email;
            if (username) user.username = username;
            if (phonenumber) user.phonenumber = phonenumber;
            if (password) {
                const saltRounds = 10;
                user.password = await bcrypt.hash(password, saltRounds);
            }

            await user.save();

            res.status(200).json({
                message: 'User updated successfully',
                user: {
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    phonenumber: user.phonenumber
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Something went wrong while updating the user' });
        }
    }
];