const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const {jwtAuthMiddleware,generateToken} = require("./../jwt");
const User = require('../models/user');

const checkAdminRole = async(userId) => {
    try{
        const user = await user.findById(userId);
        if(user.role === 'admin'){
            return true;
        }
    }catch(err){
        return false;
    }
}

// POST route to add a candidate
router.post('/',jwtAuthMiddleware,async (req,res) => {
    try{
        if(!(await checkAdminRole(req.user.id))){
            
            return res.status(403).json({message : "User not have admin role"});
        }

        const data = req.body; // Assuming the request body contains the candidate data

        // Create a new candidate document using the Mongoose model
        const newCandidate = new Candidate(data);

        //Save the new candidate to the database
        const response = await newCandidate.save();
        console.log("Data saved ");
    
      res.status(200).json({response: response});
    } catch(err){
         console.log(err);
         res.status(500).json({error :'Internal Server Error'})          
    }
})

// Using PUT method to change the password
router.put('/:candidateId',jwtAuthMiddleware, async (req,res) => {
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message : 'user does not have admin role'})

        const candidateId = req.params.candidateId; // Extract the candidate ID from the URL parameter
        const updateCandidateData = req.body; // Updated data from the candidate
        const response = await Candidate.findByIdAndUpdate(candidateId,updateCandidateData,{         
             new : true, // Return the Updated document,
            runValidators : true // Run mongoose validation
        })
        if(!response){
            res.status(403).json({error : 'Candidate not found'})
        }
        console.log("Candidate Data updated");
        res.status(200).json(response);    
      }
      catch(err){
            console.log(err);
            res.status(500).json({Error : 'Internal Server Error'})        
      }
    })

    // Using DELETE to remove the candidates(Only admin have access)
router.delete('/:candidateId',jwtAuthMiddleware, async (req,res) => {
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message : 'user does not have admin role'})

        const candidateId = req.params.candidateId; // Extract the candidate ID from the URL parameter
        const response = await Candidate.findByIdAndDelete(candidateId)      
        if(!response){
            res.status(403).json({error : 'Candidate not found'})
        }
        console.log("Candidate Deleted");
        res.status(200).json(response);    
      }
      catch(err){
            console.log(err);
            res.status(500).json({Error : 'Internal Server Error'})        
      }
    })

    // Let's start voting
    router.post('/vote/:candidateId', jwtAuthMiddleware,async (req,res) => {
        // no admin can vote
        // user can only vote once 

       candidateId = req.params.candidateId;
       userId  = req.params.id;

       try{
        // Find the Candidate document with the specified candidateId 
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message : 'Candidate not found'})
        }
        if(!User){
            return res.status(404).json({message : 'User not found'})
        }
        if(User.isVoted){
            res.status(400).json({ message : 'You have already voted' })
        }
        if(User.role == 'admin'){
            res.status(403).json({message : 'admin is not allowed'})
        }

        // Update the Candidate document to record the vote 
        candidate.votes.push({user : userId})
        candidate.voteCount++;
        await candidate.save();

        // Update the user document 
        User.isVoted = true;
        await User.save();

        res.status(400).json({message : 'Vote recorded successfully'})
       
       }catch(err){
        console.log(err);
        res.status(500).json({Error : 'Internal Server Error'})   
       }
    })

    // Vote count 
    router.get('/vote/count', async (req,res) => {
      try{
      // Find all candidates and sort them by voteCount in descending order
      const candidate = await Candidate.find().sort({voteCount : 'desc'});
      
        // Map the candidates to only return their name and voteCount.
        const voteRecord = candidate.map((data) =>{
           return{
            party : data.party,
            count : data.voteCount            
           }
           res.status(200).json(voteRecord);
        })
      }catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal Server Error'}) 
      }
    })

module.exports = router;