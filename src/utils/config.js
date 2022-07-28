// -------------------------------------- Configs --------------------------------------------

// Server Port
exports.PORT = process.env.PORT;

// MongoDB Cluster URL
exports.MONGODB_URI = process.env.MONGODB_URI;

// CORS 
exports.ORIGIN = process.env.ORIGIN;

// Hased Password 
exports.SALT = process.env.SALT;

// JWT 
exports.JWT_SECRET = process.env.JWT_SECRET;












// // -------------------------------------- Configs --------------------------------------------
// const config = {
//     production: {
//         PORT: process.env.PORT,                // Server Port
//         MONGODB_URI: process.env.MONGODB_URI,   // MongoDB Cluster URI
//         ORIGIN: process.env.ORIGIN,            // CORS 
//         JWT_SECRET: process.env.SECRET,         // JWT Secret key
//         SALT: process.env.SALT,                // Hased Password 
//     },
//     default: {
//         PORT: 3000,
//         SECRET: 'mysecretkey',
//         MONGODB_URI: "mongodb+srv://CCAnkit:CCAnkit09@clusternew.gds9x.mongodb.net/Outshade",
//         ORIGIN: process.env.ORIGIN,
//         JWT_SECRET: "Secret_Key",
//         SALT: 10,
//     }
// }

// // -------------------------------------- Config Function --------------------------------------------
// function get(env) {
//     return config[env] || config.default
// }

// module.exports = get;
