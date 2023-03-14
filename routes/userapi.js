const express=require('express');
const router= express.Router()
const User=require('../models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = 'random';
const authenticateToken = require('../authorization/auth');
const { body, validationResult } = require('express-validator');

//signup api
const Validator = require('validatorjs');

router.post('/v1/auth/signup', async (req, res) => {
  // Define validation rules
  const validationRules = {
    name: 'required|min:2',
    email: 'required|email',
    password: 'required|min:6',
  };

  // Perform validation
  const validation = new Validator(req.body, validationRules);
  if (validation.fails()) {
    const errors = validation.errors.all();
    const formattedErrors = Object.keys(errors).map((key) => {
      const error = errors[key][0];
      if (key === 'email' && error === 'validation.unique') {
        return { param: key, message: 'User with this email address already exists.', code: 'RESOURCE_EXISTS' };
      } else if (key === 'name' && error === 'validation.min') {
        return { param: key, message: 'Name should be at least 2 characters.', code: 'INVALID_INPUT' };
      } else if (key === 'password' && error === 'validation.min') {
        return { param: key, message: 'Password should be at least 6 characters.', code: 'INVALID_INPUT' };
      }
      return { param: key, message: error, code: 'INVALID_INPUT' };
    });
    return res.status(400).json({ status: false, errors: formattedErrors });
  }

  try {
    const { name, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: false, errors: [{ message: 'User already exists', code: 'RESOURCE_EXISTS' }] });
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
    res.status(400).json({ status: false, errors: [{ message: err.message }] });
  }
});



//signin api
router.post('/v1/auth/signin',
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password').notEmpty().withMessage('Please provide a password.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors.array().map((error) => {
        return {
          param: error.param,
          message: error.msg,
          code: 'INVALID_INPUT'
        };
      });
      return res.status(400).json({ status: false, errors: validationErrors });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: false, errors: [{ param: 'email', message: 'The credentials you provided are invalid.', code: 'INVALID_CREDENTIALS' }] });
    }

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ status: false, errors: [{ param: 'password', message: 'The credentials you provided are invalid.', code: 'INVALID_CREDENTIALS' }] });
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
router.get('/v1/auth/me', authenticateToken, async (req, res) => {
    const user = req.user;
  
    if (!user) {
      return res.status(401).json({
        status: false,
        errors: [
          {
            message: "You need to sign in to proceed.",
            code: "NOT_SIGNEDIN"
          }
        ]
      });
    }
  
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
  });
  


module.exports= router