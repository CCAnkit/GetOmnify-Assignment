const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/config.js");


// --------------------------------- Authorization feature ---------------------------------------
const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies['Authorization'];

    if (token) { 
      const decodeToken = jwt.verify(token, "Outshade" || JWT_SECRET, {ignoreExpiration: true});
      

      if (decodeToken) {

        let expiration = decodeToken.exp;
      
        let tokenExtend = Math.floor(Date.now() / 1000); 
    
        if (expiration < tokenExtend){
          return res
            .status(401)
            .send({ status: false, message: "Token is expired" })
        };
    
        req.userId = decodeToken.userId;
    
        req.token = decodeToken.token;

      } else {  
        return res
          .status(403)
          .send({ status: false, message: 'You are not autherised to access.' });
      } 
    } else {
        return res
          .status(403)
          .send({ status: false, message: 'Token must be present' });
    }

      next();

    } 
    catch (err) {
        console.log(err);
        res.status(500).send({ message: err.message });
    }
};

module.exports = userAuth;


