const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/AuthM');
const Favorite = require('../model/Favorites');
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const WEATHER_BASE_URL = process.env.WEATHER_URL;
const FORECAST_BASE_URL = process.env.FORECAST_URL;
const GOOGLE_PLACES_BASE_URL = process.env.GOOGLE_PLACE_URL;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_P_API_KEY;

console.log(process.env.WEATHER_URL); 
console.log(process.env.FORECAST_URL);
console.log(process.env.GOOGLE_P_API_KEY);
console.log(process.env.GOOGLE_PLACE_URL)

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
            user: { email: newUser.email, username: newUser.username, phonenumber: newUser.phonenumber }
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
        console.log(user.email, user.password)
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

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with the provided email' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetURL}\n\nIf you didn't request this, please ignore this email.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: 'Password reset email sent successfully. Please check your email.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while processing the request' });
    }
};

exports.getUser = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        const favorites = await Favorite.find({ userId });

        res.status(200).json({
            email: user.email,
            phonenumber: user.phonenumber,
            username: user.username,
            createdAt: user.createdAt,
            favorites: favorites, 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while fetching the user profile and favorites' });
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

exports.search = async (req, res) => {
    const { city, radius = 5000 } = req.query;

    if (!city) {
        return res.status(400).json({ message: 'City name is required' });
    }

    try {
        const weatherResponse = await axios.get(WEATHER_BASE_URL, {
            params: {
                q: city,
                appid: API_KEY,
                units: 'metric',
            },
        });

        const weatherData = weatherResponse.data;
        const { coord: { lat, lon }, weather } = weatherData;

        const attractionsResponse = await axios.get(GOOGLE_PLACES_BASE_URL, {
            params: {
                location: `${lat},${lon}`,
                radius,
                type: 'tourist_attraction',
                key: GOOGLE_PLACES_API_KEY,
            },
        });

        const attractions = attractionsResponse.data.results;

        const suggestions = [];
        const mainWeather = weather[0]?.main.toLowerCase();

        if (mainWeather.includes('rain')) {
            suggestions.push('Visit indoor attractions like museums or aquariums.');
        } else if (mainWeather.includes('clear')) {
            suggestions.push('Perfect day for outdoor activities like visiting parks or gardens.');
        } else if (mainWeather.includes('clouds')) {
            suggestions.push('Great time for exploring landmarks or casual sightseeing.');
        } 
          else if (mainWeather.includes('snow')) {
            suggestions.push('Snowy weather? Try winter sports or cozy indoor activities like cafes and theaters.');
        } else if (mainWeather.includes('wind')) {
            suggestions.push('Windy? Perfect for exploring nature trails, hiking, or visiting windmills.'); 
        } else if (mainWeather.includes('fog')) {
            suggestions.push('Foggy weather? A great time to visit mystical, atmospheric spots like historical sites.');
        }
          else {
            suggestions.push('Explore local attractions and adapt to the weather or just chill inside.');
        }

        res.status(200).json({
            weather: weatherData,
            attractions,
            suggestions,
        });
    } catch (error) {
        console.error(error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'City not found' });
        }
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.forecast = async(req,res) => {
    const { city } = req.query;

    if (!city) {
        return res.status(400).json({ message: 'City name is required' });
    }

    try {
        const response = await axios.get(FORECAST_BASE_URL, {
            params: {
                q: city,
                appid: API_KEY,
                units: 'metric',
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error(error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'City not found' });
        }
        res.status(500).json({ message: 'Something went wrong' });
    } 
}

exports.forecast5days = async (req, res) => {
    const { city } = req.query;

    if (!city) {
        return res.status(400).json({ message: 'City name is required' });
    }

    try {
        const response = await axios.get(FORECAST_BASE_URL, {
            params: {
                q: city,
                appid: API_KEY,
                units: 'metric',
            },
        });

        const { list, city: cityInfo } = response.data;
        res.status(200).json({
            city: cityInfo.name,
            country: cityInfo.country,
            forecast: list,
        });
    } catch (error) {
        console.error(error.message);

        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'City not found' });
        }

        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.addToFavorites = [ authMiddleware, async (req, res) => {
    const userId = req.userId;
    const { itemType, itemId, name, location, description, imageUrl } = req.body;

    if (!itemType || !itemId || !name || !location) {
        return res.status(400).json({ message: 'Item details are required' });
    }

    try {
        const newFavorite = new Favorite({
            userId,
            itemType,
            itemId,
            name,
            location,
            description,
            imageUrl,
            weatherSuggestion: suggestion
        });

        await newFavorite.save();

        res.status(200).json({ message: 'Favorite added successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Something went wrong while adding to favorites' });
    }
}];