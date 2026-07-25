require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("✅ MongoDB Connected");

        // Check if admin already exists
        const existingUser = await User.findOne({ username: "admin" });

        if (existingUser) {
            console.log("⚠️ Admin already exists");
            return mongoose.connection.close();
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        const user = new User({
            username: "admin",
            password: hashedPassword
        });

        await user.save();

        console.log("✅ Admin created successfully");

        await mongoose.connection.close();

    } catch (err) {
        console.error(err);
    }
}

createAdmin();


