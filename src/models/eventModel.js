const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const eventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: true,
        trim: true
    },
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    eventDate: {
        type: String,
        required: true,
    },
    eventDescription: {
        type: String,
        trim: true
    },
    eventCreator: {
        type: ObjectId,
        ref: "User",
        required: true,
    },
    invite:[{
        invitedUsers: {
            type: ObjectId,
            ref: "User",
        },
        invitedAt:{
            type:String
        }
    }]
  }, { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
