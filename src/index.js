const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config"); // Import your database model

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// User Registration
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };

    try {
        // Check if the user already exists
        const existingUser = await collection.findOne({ name: data.name });
        if (existingUser) {
            return res.send("User already exists. Please choose a different username.");
        }

        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        // Replace plain password with hashed password
        data.password = hashedPassword;

        // Save user data in the database
        const userdata = await collection.insertMany([data]);
        console.log("User registered:", userdata);

        // Redirect or send a success response
        res.send("Registration successful. Please log in.");
    } catch (error) {
        console.error("Error during registration:", error);
        res.send("An error occurred during registration. Please try again.");
    }
});

// User Login
app.post("/login", async (req, res) => {
    try {
        // Find user by username
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            return res.send("Username not found!");
        }

        // Compare the password with the hashed password in the database
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            res.render("home"); // Render the home page on successful login
        } else {
            res.send("Wrong Password!");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.send("An error occurred during login. Please try again.");
    }
});

// Start the server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
