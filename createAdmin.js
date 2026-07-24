const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect("mongodb://127.0.0.1:27017/hotelDB")
.then(async () => {

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const user = new User({
        username: "admin",
        password: hashedPassword
    });

    await user.save();

    console.log("✅ Admin created successfully");

    mongoose.connection.close();

})
.catch(err => console.log(err));