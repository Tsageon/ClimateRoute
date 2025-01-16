# ClimateRoute's Backend

Welcome to the repo! This backend application serves as the server-side implementation for a Planner manager. It allows users to interact with a location-related data such as available attractions, restaurants, and more(**ComingSoon**).

This backend is built using **Node.js**, **Express.js**, **MongoDB** and **Nodemailer** for handling date and time operations across different time zones.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [API Endpoints](#api-endpoints)

## Features

- **Weather Data**: Allows CRUD operations on Planner data such as name, location, etc.
- **Nearby Attractions**: Each restaurant has a set of available time slots, which users can interact with.
- **User Authentication**: A basic user authentication flow, ensuring access to restaurant data.
- **MongoDB Integration**: Data is stored and managed in MongoDB.
- **Nodemailer Integration**: Send emails to users.

## Technologies Used

- **MongoDB**: The database to store data for users etc.
- **Node.js**: The runtime environment for the application.
- **Nodemailer**: To send emails to users.
- **Nodemon**: The tool to keep the apps runtime enviroment
               running with every change.
- **JWT**: For authentication and keeping data safe.
- **Express.js**: The web framework used for building the server.
- **Bcrypt.js**: To hash passwords and to bypass deployment issues.

## Installation

To run the backend portion of this project follow these steps:

### 1. Clone the repository

``bash
git clone <https://github.com/Tsageon/ClimateRoute.git>

### 2.Install the dependencies

``bash
npm install

## API Endpoints

### User Endpoints

**HTTP Methods**
**Get** the user's profile:
`http:localhost:5000/api/profile`

**Post** the user's favorites:
`http:localhost:5000/api/addfavorite`

**Post** to login in the user:
`http:localhost:5000/api/login`

**Post** to register a user:
`http:localhost:5000/api/register`

**Post** to logout a user:
`http:localhost:5000/api/logout`

**Post** when you forget your password:
`http:localhost:5000/api/forgot-password`

**Post** to reset your password:
`http:localhost:5000/api/reset-password/:token or`
`http://localhost:5000/api/reset-password/12345abcd`(e.g)

**Put** to update your user info:
`http://localhost:5000/api/update`

### Weather Endpoints

**Get** the weather for a specific location:
`http://localhost:5000/api/search?location=London`(e.g Oh by the way it has some suggetsions based on weather conditions)

**Get** the forecast for next couple of days:
`http://localhost:5000/api/forecast?location=London`

**Get** the forecast for the next five days:
`http://localhost:5000/api/fivedayforecast?location=London`

## License

This project is licensed under the MIT License - see the
`https://opensource.org/licenses/MIT` for details.