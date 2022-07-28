const express = require("express");
const router = express.Router();

const { createUser, 
        login,
        logout,
        changePassword,
        forgotPassword,
        resetPassword
} = require("../controllers/userController.js");

const { createEvent,
        inviteUser,
        getEventsByFilter,
        getEventById,
        updateEvent,
} = require("../controllers/eventController.js");

const { userAuth } = require("../middlewares/auth.js");


// User API's
router.post('/user/register', createUser);      // Create User

router.post('/user/login', login);        // User Login

router.get('/user/logout', logout);             // User Logout

router.put('/user/changePassword/:userId', userAuth, changePassword);      // User can change his Password

router.put('/user/forgotPassword', forgotPassword);       // If user forgot his Password

router.post('/user/resetPassword', resetPassword);       // User can reset his passwor


// Event API's
router.post('/event/new', userAuth, createEvent)          // Create New Event

router.post('/event/invite/:userId/:eventId', userAuth, inviteUser)        // Intite User

router.get('/event/getList', userAuth, getEventsByFilter)      // Get the list of the Events by filter

router.get('/event/fetch/:eventId', userAuth, getEventById)     // Get Event by Event ID

router.put('/event/update/:userId/:eventId', userAuth, updateEvent)     // Update Event by ID


module.exports = router;