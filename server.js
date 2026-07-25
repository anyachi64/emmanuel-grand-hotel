require("dotenv").config();

const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("Node DNS:", dns.getServers());
const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Room = require("./models/Room");
const Booking = require("./models/Booking");
const User = require("./models/User");
const multer = require("multer");


const app = express();

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() + "-" + file.originalname
        );

    }

});

const upload = multer({
    storage
});

app.use(express.json());

app.use(
  session({
    secret: "hotel-secret-key",
    resave: false,
    saveUninitialized: false
  })
);


app.use(express.static("public"));



// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Get Rooms API
app.get("/api/rooms", async(req, res) => {


  const rooms = await Room.find();
  res.json(rooms);
  });

// Book Room API
app.post("/api/book", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            room,
            checkin,
            checkout,
            adults,
            children
        } = req.body;

        const selectedRoom = await Room.findOne({ name: room });

        if (!selectedRoom) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        if (!selectedRoom.available) {
            return res.json({
                success: false,
                message: "Room already booked"
            });
        }

        const nights =
            (new Date(checkout) - new Date(checkin))
            / (1000 * 60 * 60 * 24);

        const totalPrice = nights * selectedRoom.price;

        const bookingReference =
            "EGH-" + Date.now();

        const booking = new Booking({

            bookingReference,

            name,

            email,

            phone,

            room,

            checkin,

            checkout,

            adults,

            children,

            nights,

            totalPrice,

            status: "Booked"

        });

        await booking.save();

        selectedRoom.available = false;
        await selectedRoom.save();

        res.json({

            success: true,

            message: "Booking successful!",

            booking

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

});


app.get("/api/bookings", async (req, res) => {

  const bookings = await Booking.find()
  res.json(bookings);

});


app.delete("/api/bookings/:id", async (req, res) => {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({
            success:false,
            message:"Booking not found"
        });
    }

    await Room.findOneAndUpdate(
        { name: booking.room },
        { available: true }
    );

    await Booking.findByIdAndDelete(req.params.id);

    res.json({
        success:true,
        message:"Booking cancelled"
    });

});


app.post("/api/rooms", upload.single("image"), async (req, res) => {

    try {

        const { name, price } = req.body;

        const room = new Room({

            name,

            price,

            available: true,

            image: req.file
                ? req.file.filename
                : "placeholder.jpg"

        });

        await room.save();

        res.json({

            success: true,

            message: "Room added successfully!"

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Failed to add room"

        });

    }

});

app.put("/api/rooms/:id", upload.single("image"), async (req, res) => {

    try {

        const updateData = {
            name: req.body.name,
            price: req.body.price
        };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        await Room.findByIdAndUpdate(
            req.params.id,
            updateData
        );

        res.json({
            success: true,
            message: "Room updated successfully!"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Failed to update room"
        });

    }

});

app.delete("/api/rooms/:id", async (req, res) => {

    try {

        const room = await Room.findById(req.params.id);

        if (!room) {

            return res.status(404).json({

                success: false,

                message: "Room not found"

            });

        }

        await Room.findByIdAndDelete(req.params.id);

        res.json({

            success: true,

            message: "Room deleted successfully!"

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

});


app.put("/api/checkin/:id", async (req, res) => {

    try {

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        booking.status = "Checked In";

        await booking.save();

        res.json({
            success: true,
            message: "Guest checked in successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});


app.put("/api/checkout/:id", async (req, res) => {

    try {

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        booking.status = "Checked Out";
        await booking.save();

        await Room.findOneAndUpdate(
            { name: booking.room },
            { available: true }
        );

        res.json({
            success: true,
            message: "Guest checked out successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});

app.post("/api/login", async (req, res) => {

  const { username, password } = req.body;

  const user = await User.findOne({
    username
  });

  if (!user) {
    return res.json({
      success: false,
      message: "User not found"
    });
  }

  const match = await bcrypt.compare(
    password,
    user.password
  );

  if (!match) {
    return res.json({
      success: false,
      message: "Wrong password"
    });
  }

  req.session.user = {
    username: user.username
  };

  res.json({
    success: true,
    message: "Login successful"
  });
});

app.get("/api/me", (req, res) => {
  if (req.session.user) {
    return res.json({
      loggedIn: true,
      user: req.session.user
    });
  }

  res.json({
    loggedIn: false
  });
});

app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
});

console.log(process.env.MONGODB_URI);

async function connectDB() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed");
    console.error(err);
  }
}

connectDB();


app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});