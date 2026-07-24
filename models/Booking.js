const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    bookingReference: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    room: {
        type: String,
        required: true
    },

    checkin: {
        type: String,
        required: true
    },

    checkout: {
        type: String,
        required: true
    },

    adults: {
        type: Number,
        required: true
    },

    children: {
        type: Number,
        default: 0
    },

    nights: {
        type: Number,
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: "Booked"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);

