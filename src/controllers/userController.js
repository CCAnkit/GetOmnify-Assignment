const userModel = require("../models/userModel.js");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const { JWT_SECRET, SALT } = require("../utils/config.js");

const {
  isValid,
  isValidObjectId,
  isValidRequestBody,
  isValidName,
  isValidNumber,
  isValidEmail,
} = require("../utils/validations.js");


// ---------------------------------- Create User ---------------------------------------

const createUser = async (req, res) => {
  try {
    if (!isValidRequestBody(req.body))
      return res.status(400).json({ status: false, msg: "Please provide the User details" });

    let { name, email, phone, password, securityQuestionAnswer } = req.body;
 
    if (!isValid(name))
      return res
        .status(400)
        .json({ status: false, msg: "Please provide the Full Name" });

    if (!isValidName(name))
      return res
        .status(400)
        .json({ status: false, msg: "Please provide the Valid Name without any specail charsacter or numbers." });
    
    if (!isValid(email))
      return res
        .status(400)
        .json({ status: false, msg: "Please provide the Email Address" });

    if (!isValidEmail(email))
      return res
        .status(400)
        .json({ status: false, msg: "Please provide the valid Email Address" });

    let isEmailExist = await userModel.findOne({ email });
    
    if (isEmailExist)
      return res
        .status(400)
        .json({ status: false, msg: `${emailId} is already exists` });
    
    if (!isValid(phone))
      return res
        .status(400)
        .json({ status: false, msg: "Please provide the Contact Number" });

    if (!isValidNumber(phone))
      return res
        .status(400)
        .json({ status: false, msg: "Please provide the valid Contact Number." });

    let isPhoneExist = await userModel.findOne({ phone });
    
    if (isPhoneExist)
      return res
        .status(400)
        .json({ status: false, msg: `${phone} is already exists` });

    if (!isValid(password))
      return res
        .status(400)
        .json({ status: false, msg: "Please provide the Password" });
    
    if (password.length < 8 || password.length > 15) 
      return res
        .status(400)
        .send({ status: false, massage: "Password length should not be less than 8 and not be greater than 15" });

    const salt = bcrypt.genSaltSync(Number(SALT));
    const hashPassword = bcrypt.hashSync(password, salt);     
        
    if (!isValid(securityQuestionAnswer))
      return res
        .status(400)
        .json({ status: false, msg: "Please answer the Security Question" });

    const createUser = {
      name: name, 
      email: email, 
      phone: phone, 
      password: hashPassword, 
      securityQuestionAnswer: securityQuestionAnswer
    };

    let user = await userModel.create(createUser);

    res.status(201).send({
      type: "success", 
      status: true, 
      message: "User is created successfully", 
      data: user 
    });
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, msg: err.message });
  }
};


// --------------------------------- Login User ---------------------------------------

const login = async (req, res) => {
  try {

    let { email, password } = req.body;
    
    if (!email || !password) 
      return res
        .status(400)
        .json({ status: false, msg: "Please provide all the details"});
    
    const user = await userModel.findOne({ email });
    
    if (!user)
      return res
        .status(400)
        .json({ status: false, msg: "Email is not correct, Please check your credentials again" });

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword)
      return res
        .status(400)
        .json({ status: false, msg: "Password is invalid, Please check your credentials again"});

    if (validatePassword == true) {
      
      const token = await jwt.sign({
        userId : user._id,   
        iat: Math.floor(Date.now() / 1000),
        // exp: Math.floor(Date.now() / 1000) + (10*60*60)
      }, "Outshade" || JWT_SECRET, {expiresIn: "12h" }); 

      return res
        .cookie('Authorization', token)
        .status(200).send({ 
          type: "success", 
          status: true, 
          message: `User logged in successfully`, 
          data: { name: user.name, userId: user._id, token: token } 
        })
    
    } else {

      return res
        .status(400)
        .json({ status: false, msg: "Password is invalid, Please check your credentials again"});
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, msg: err.message });
  }
};



// --------------------------------- Logout User ---------------------------------------

const logout = async (req, res) => {
    try {

      return res.clearCookie('Authorization').status(200).send({
          type: "success", 
          status: true, 
          message: "Logged out succesfully", 
      });
        
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: false, msg: err.message });
    }
};


// --------------------------------- Change Password ---------------------------------------

const changePassword = async (req, res) => {
  try {

    let password = req.body.password
    
    let userId = req.params.userId
    
    if (!isValidObjectId(userId)) 
        return res
          .status(400)
          .send({ status: false, message: "Please provide the valid UserId" })
    
    const userDetails = await userModel.findById(userId).lean()
    
    if (!userDetails) {
        return res.status(404).send({ status: false, message: "User does not exists" })
    }
    
    if (!isValid(password)) {
        res.status(400).send({ status: false, message: `Please provide the new password` })
        return
    }
    
    if (password.length < 8 || password.length > 15) 
      return res
        .status(400)
        .send({ status: false, massage: "Password length should not be less than 8 and not be greater than 15" })
    

    if (req.decodedToken.UserId == userId) {

      let hashPassword = bcrypt.hashSync(password, Number(SALT));

      let changePassword = await userModel.findOneAndUpdate(
        { _id: userId }, 
        { $set: { password: hashPassword } }, 
        { new: true, upsert: true })
        
        return res
          .status(200)
          .send({ status: true, message: "Your Password is successfully changed" })

    } else {
        return res
          .status(403)
          .send({ status: false, message: "Unauthorized Access" })
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, msg: err.message });
  }
};


// --------------------------------- Update Password ---------------------------------------

const forgotPassword = async (req, res) => {
    try {
      
      const token = req.body.token

      const newPassword = req.body.newPassword

      const decodeToken = jwt.verify(token, "Outshade" || JWT_SECRET, {ignoreExpiration: true})
      
      let user = await userModel.findOne({ _id: jwt.decode.UserId })

      if(decodeToken) {
      
        let hashPassword = bcrypt.hashSync(newPassword, Number(SALT));

        let changepassword = await userModel.findOneAndUpdate(
          { _id: decodeToken.UserId }, 
          { forgotToken: null, password: hashPassword })
        
        return res.status(200).send({ 
            type: "success", 
            status:true, 
            msg: "Your password is successfully changed"})
      
      } else {
          return res
            .status(401)
            .send({ status: false, msg: "Unauthorized Access" })
      }
      
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: false, msg: err.message });
    }
};

  
// --------------------------------- Reset Password ---------------------------------------

const resetPassword = async (req, res) => {
    try {

      const email = req.body.email

      if (!isValid(email)) 
        return res
          .status(400)
          .send({ status: false, msg: `Please provide the Email Address` })

      if (!isValidEmail(email)) 
        return res
          .status(400)
          .send({ status: false, msg: `Please provide the correct Email Address` })
        
      const user = await userModel.findOne({ email: email })
        
      if (!user) 
        return res
          .status(401)
          .send({ status: false, msg: 'Email is not correct, Please check your credentials again' })
        
      const token = await jwt.sign({
          userId: user._id,
          email: email,   
          iat: Math.floor(Date.now() / 1000),
          // exp: Math.floor(Date.now() / 1000) + (10*60*60)
      }, "Outshade" || JWT_SECRET, {expiresIn: "12h" }); 
    
      var transport = nodemailer.createTransport({
          host: "smtp.mailtrap.io",
          port: 2525,
          auth: {
              user: "8b0d6cdc6c82df",
              pass: "e5fe02dc487f3f",
          } 
      });

      var mailData = {
            from: '"Outshade Team" <no-reply@outshade.com>',
            to: `${email}`,
            subject: 'Reset Password',
            text: `Hi ${user.fullName}, There was a request to change your password!
                  If you did not make this request then please ignore this email.;) `,
            html: `<b>Hey ${user.fullName}</b><br> There was a request to change your password!</br>If you did not make this request then please ignore this email. Copy Token:-<strong>${token} </strong>and paste token on website<a href='localhost:5000/resetPassword'>Link</a> <button href='localhost:5000/resetPassword'>Click Here</button>`,
            auth:{
                email: email,
                token: token
            }
        };

      transport.sendMail(mailData, async(error, info) => {
        if (error) {   
          console.log(error);
          return res
            .status(500)
            .send({ status: false, msg: error.message });

        } else {
            console.log('Email sent: ' + info.response);
            await userModel.findOneAndUpdate({ _id: user._id }, {$set: { forgotToken: token }})
            return res.status(200).send({
              type: "success", 
              status:true, 
              msg:"Mail is sent successfully, Please check your Email Address."})
          }
        });
        
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: false, msg: err.message });
    }
};
  

module.exports = {  createUser, 
                    login, 
                    logout, 
                    changePassword, 
                    forgotPassword, 
                    resetPassword  
                };