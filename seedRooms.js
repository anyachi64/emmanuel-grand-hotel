const mongoose = require("mongoose");
const fs = require("fs");
const Room = require("./models/Room");

mongoose.connect("mongodb://127.0.0.1:27017/hotelDB")
.then(async () => {

    console.log("✅ MongoDB Connected");

    const rooms = JSON.parse(
        fs.readFileSync("./data/rooms.json")
    );

    await Room.deleteMany({});

    await Room.insertMany(rooms);

    console.log("✅ Rooms imported successfully!");

    mongoose.connection.close();

})
.catch(err => console.log(err));