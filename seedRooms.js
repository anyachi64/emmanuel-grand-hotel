require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const fs = require("fs");
const Room = require("./models/Room");



mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
    console.log("✅ MongoDB Connected");

    const rooms = JSON.parse(
        fs.readFileSync("./data/rooms.json", "utf8")
    );

    await Room.deleteMany({});
    await Room.insertMany(rooms);

    console.log("✅ Rooms imported successfully!");

    await mongoose.connection.close();
})
.catch(err => {
    console.error(err);
});