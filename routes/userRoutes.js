const express = require('express');
const router = express.Router();
const User=require('../models/user');
const bcrypt=require('bcrypt');
const Expense = require('../models/expense');
const {jwtAuthMiddleware,generateToken}=require('../jwt');


//create user route or signup
router.post('/signup',async(req,res)=>{
    try{
      const data=req.body
      const newUser=new User(data);
  
      const response= await newUser.save();
      console.log(('data saved'));
  
      const payload={
          id:response.id
      }
  
      console.log(JSON.stringify(payload));
      const token=generateToken(payload);
  
      console.log("Token is: ",token);
  
      res.status(200).json({response:response,token:token});
  
  }catch(e)
  {
      console.log(e);
      res.status(500).json({error:"Internal server errror"})
  }
  })
  
  
  //login route
  router.post('/login',async(req,res)=>{
      try{
      //extract adharcardno &npassword from req.body
      const {aadharCardNumber,password}=req.body;
  
      //find user by adharcardno
      const user=await User.findOne({aadharCardNumber:aadharCardNumber});
  
      //if user doesnot exist or pass does not match return error
      if(!user||(await bcrypt.compare(password,user.password))){
          return res.status(401).json({error:'Invalid username or password'})
      }
      const payload={
          id:user.id
      }
  
      const token=generateToken(payload);
  
      console.log("Token is: ",token);
      res.json({token})
  
  }
      catch(err){
          console.log(e);
          res.status(500).json({error:"Internal server errror"})
      }
  })


//retrieve user details
router.get('/:id',async(req,res)=>{
try{
    const user= await User.findById(req.params.id);
    if(!user)return res.status(404).json({error:"No such user found"})

        res.status(200).json({user:user})
}catch(e)
{
    console.log(e);
    res.status(500).json({error:"Internal server errror"})
}

})

// Retrieve individual user expenses
router.get('/:id/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find({ participants: req.params.id }).populate('participants').populate('shares.user');
        res.status(200).json({expenses});
    } catch(e)
    {
        console.log(e);
        res.status(500).json({error:"Internal server errror"})
    }
  });

module.exports=router;