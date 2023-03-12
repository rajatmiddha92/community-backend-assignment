const express=require('express');
const router= express.Router()
const User=require('../models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = 'random';
const authenticateToken = require('../authorization/auth');


//signup api
router.post('/v1/auth/signup',async(req,res)=>{
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists' });
        }
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Create user
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, secret, { expiresIn: '6h' });
        // Return response
        res.status(201).json({
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
          },
          meta: {
            access_token: token,
          },
        });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
})


//signin api
router.post('/v1/auth/signin', async (req, res) => {
    const { email, password } = req.body;
  
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  
    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  
    // Create and sign a JWT
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      secret,
      { expiresIn: '1h' }
    );
  
    // Send back the user data and token in the response
    res.json({
      status: true,
      content: {
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          created_at: user.createdAt
        },
        meta: {
          access_token: token
        }
      }
    });
  });

  

//get me as a user api
router.get('/v1/auth/me',authenticateToken,async(req,res)=>{
    const user = req.user; // assuming the user object was attached to the request object by the middleware
    res.status(200).json({
      status: true,
      content: {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }
      }
    });
})


module.exports= router