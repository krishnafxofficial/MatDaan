const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require("./../jwt");

// POST route to add a user
router.post('/signup',async (req,res) => {
    try{
        const data = req.body; // Assuming the request body contains the user data

        // Create a new user document using the Mongoose model
        const newUser = new User(data);

        //Save the new person to the database
        const response = await newUser.save();
        console.log("Data saved ");
        
        const payload = {
          id : response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is :", token);
      res.status(200).json({response: response,token: token});
    } catch(err){
         console.log(err);
         res.status(500).json({error :'Internal Server Error'})          
    }
})

// Login route
router.post('/login',async (req,res) => {
      try{
        // Extract the aadharCardNumber and password from request body
        const {aadharCardNumber,password} = req.body;

        //Find the user by username
          const user = await user.findOne({aadharCardNumber : aadharCardNumber});

         // If user does not exist or password does not match ,return error
         if(!user || !(await user.comparePassword(password))){
          res.status(401).json({error : 'Invalid username or password'});
         } 

         // Generate Token 
         const payload = {
          id : user.id,
         }
        const token = generateToken(payload);

        // return token as a response
        res.json({token})
      }catch(err){
            console.error(err);
            res.status(500).json({error : 'Internal Server error'})
      }
})


// Profile route
router.get('/profile',jwtAuthMiddleware,async(req,res) => {
  try{
    const userData  = req.user;
    const userId = userData.id;
    const user = await Person.findById(userId);

    res.status(200).json({user});
  }catch(err){
      console.log(err);
      res.status(500).json({error : 'Internal Server error'})
  }
})

// Using PUT method to change the password
router.put('/profile/password',jwtAuthMiddleware, async (req,res) => {
  try{
    const userId = req.user; // Extract the ID from the token
    const {currentPassword,newPassword} = req.body; // Extract current and new password from the req. body.

         //Find the user by userid
         const user = await user.findById(userId);
        //  Password does not match ,return error.
          if(!(await user.comparePassword(currentPassword))){
          res.status(401).json({error : 'Invalid username or password'});
           } 

        // Update the user's password   
        user.password = newPassword;
        await user .save(); 

    console.log("Password updated");
    res.status(200).json({Error : 'Password Updated'});    
  }
  catch(err){
        console.log(err);
        res.status(500).json({Error : 'Internal Server Error'})        
  }
})

module.exports = router;