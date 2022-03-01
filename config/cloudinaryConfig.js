const dotenv = require('dotenv')
dotenv.config({ path: '../config/config.env' })
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: 'dg0lat2d3',
  api_key: 139481848683242,
  api_secret: 'MgV-xFV43-5U0_JWnRzjN3VL2MQ',
}); 

module.exports = cloudinary;