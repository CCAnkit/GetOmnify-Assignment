const eventModel = require("../models/eventModel.js");
const userModel = require('../models/userModel.js');
const moment = require('moment');

const {
  isValid,
  isValidObjectId,
  isValidRequestBody,
  isValidEmail,
} = require("../utils/validations.js");



// // --------------------------------- createEvent ---------------------------------------

const createEvent = async (req, res) => {
    try {
        
        let eventData = req.body;

        const { eventType, eventName, eventDescription } = eventData;

        let userId = req.params.userId;

        if (!isValidRequestBody(eventData)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the Event Data" })
    

        if (!isValidObjectId(userId)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the valid UserId" })

        if (!isValid(eventType)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the Event Type" })

        if (!isValid(eventName)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the Event Title" })
    

        if (!isValid(eventDescription)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the Event Description" })
    
        if (req.decodedToken.UserId == userId) {

            let testDate = new Date()
        
            req.body.eventDate = moment(testDate,'mm/dd/yyyy');
       
            const user = await userModel.findOne({ _id: req.decodedToken.UserId })
            
            if (!user) 
                return res
                    .status(403)
                    .send({ status: false, msg: 'Unauthorized Access' })
            
            eventData.eventCreator = req.decodedToken.UserId
        
            let newEvent = await eventModel.create(eventData)
        
            return res.status(201).send({
                type: "success", 
                status: true, 
                msg: "Event created Successfully", 
                data: newEvent })
        }

    } catch (err) {
      console.log(err);
      res.status(500).json({ status: false, msg: err.message });
    }
};

// // // ------------------------------------ Invite User --------------------------------------------

const inviteUser = async (req, res) => {
    try {
        
        const eventData = req.body 

        let userId = req.params.userId

        let eventId = req.params.eventId

        if (!isValidRequestBody(eventData)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the details like Invite's Email Id." })
        
        const { invitedUsers } = eventData

        let filter = {}
        
        if (!isValidObjectId(userId)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the valid UserId" })
        
        
        if (!isValidObjectId(eventId)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the valid Event Id" })
        

        if (!isValid(invitedUsers)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the Invitee Email Id" })
        
        
        let inviteDetails = await eventModel.findById(eventId).lean()
        
        if(!inviteDetails)
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the valid Event Id" })
        
        
        if (!isValidEmail(invitedUsers)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the valid Email Address" })
        
        
        let user = await userModel.findOne({email: invitedUsers})
        
        if(!user)
            return res
                .status(400)
                .send({ status: false, msg: "User is not Register with us." })
        
         
        let invitee = inviteDetails.invitee

        for(let i = 0; i < invitee.length; i++){

            let inviteId = invitee[i].invitedUsers
            
            if(inviteId == user._id){
                return res
                    .status(400)
                    .send({ status: false, msg: "User already invited for this Event" });
            }
        }

        filter['invitedUsers'] = user._id
        
        filter['invitedAt'] = new Date()

        if(req.decodedToken.UserId == userId){

            let updateInvite = await eventModel.findOneAndUpdate(
                    { _id: eventId }, { $push: { invitedUsers: filter }} )
            
            console.log(updateInvite)

            return res.status(200).send({ 
                    status: true, 
                    msg: "User Successfully invited for this Event", 
                    data: filter })
        
        }else{
            return res
                .status(403)
                .send({ status: false, msg: "Unauthorized Access" })
        }

    }   catch (err) {
            console.log(err);
            res.status(500).json({ status: false, msg: err.message });
    }
  };

// // --------------------------------- Get Events By Filter ---------------------------------------

const getEventsByFilter = async (req, res) => {
    try {

        const { eventDate, eventName, eventDescription } = req.query;

        let filter = {};

        if(isValid(eventDate)) {
           
            if((moment(`${eventDate}`,'MM/DD/YYYY',true).isValid())!=  true){
                return res
                    .status(400)
                    .send({ status: false, msg: "Please provide the date in this format MM/DD/YYYY" });
           };
           
           filter['eventDate'] = eventDate;
        }

        if(isValid(eventName)) {
            filter['eventName'] = { $regex: '^' + `${eventName}`, $options: 'i' };
        };

        if(isValid(eventDescription)){
            filter['eventDescription'] = { $regex: '^' + `${eventDescription}`, $options: 'i' };
        };

        if (isValidRequestBody(filter)) {

            let findevent = await eventModel.find().sort().limit(3)

            return res
                .status(200)
                .send({ status: true, msg: "successful", data: findevent })
        };

        let findevent = await eventModel.find(filter).sort().limit(3);

        return res.status(200).send({
                type: "success", 
                status: true, 
                msg: "Event fetch Successfully", 
                data: findevent });
      
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};


// // --------------------------------- Fetch Event by ID ---------------------------------------

const getEventById = async (req, res) => {
    try {

        let eventId = req.params.eventId;

        if (!isValidObjectId(eventId)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please prove the valid EventId" })
        

        let event = await eventModel.findById(eventId).lean()

        if(req.decodedToken.UserId == event.eventCreator)
            return res
                .status(200)
                .send({ type: "success", status: true, msg: "successful", data: event })
        
        else{
            return res
                .status(403)
                .send({ status: false, msg: "Unauthorized Access" })
        }
        
    }   catch (err) {
            console.log(err);
            res.status(500).json({ status: false, msg: err.message });
    }
};

  
// // -------------------------------------- Update Event --------------------------------------------

const updateEvent = async (req, res) => {
    try {

        const data = req.body;

        let userId = req.params.userId;

        let eventId = req.params.eventId;

        if (!isValidRequestBody(data)) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the Data like Event name or description." })
        
        
        if (!isValidObjectId(userId)) 
            return res
                .status(400)
                .send({ status: false, msg: "Enter provide the valid UserId" })
        
        if (!isValidObjectId(eventId)) 
            return res
                .status(400)
                .send({ status: false, msg: "Enter provide the valid eventId" })
        

        let filter = {}

        const { eventName, eventDescription } = data
        
        if(isValid(eventName)) {
                filter['eventName'] = title
        }

        if(isValid(eventDescription)){
                filter['eventDescription'] = description
        }
        
        if (Object.keys(filter).length === 0) 
            return res
                .status(400)
                .send({ status: false, msg: "Please provide the Data like Event name or description" })
         
        if(req.decodedToken.UserId == userId){

            let eventDetais = await eventModel.findOneAndUpdate({ _id: eventId }, { $set: filter })
            
            return res.status(200).send({
                    type: "success",
                    status: true,
                    msg: "update successful",
                    data: eventDetais,
            })
        
        }else{
            return res
                .status(403)
                .send({ status: false, msg: "Unauthorized Access" })
        }
        
    }   catch (err) {
            console.log(err);
            res.status(500).json({ status: false, msg: err.message });
    }
};
  

module.exports = {  createEvent, 
                    inviteUser, 
                    getEventsByFilter, 
                    getEventById, 
                    updateEvent, 
                };