const express=require('express');
const router= express.Router()
const authenticateToken = require('../authorization/auth');
const Community=require('../models/community')

//create community api
router.post('/v1/community', authenticateToken, async (req, res) => {
    const { name } = req.body;
  
    // Check if name is provided
    if (!name) {
      return res.status(400).json({ status: false, message: 'Community name is required.' });
    }
  
    // Generate slug from name
    const slug = name
  
    try {
      // Create the community
      const community = await Community.create({
        name,
        slug,
        owner: req.user.id,
      });
  
      return res.status(201).json({
        status: true,
        content: {
          data: {
            id: community.id,
            name: community.name,
            slug: community.slug,
            owner: community.owner,
            created_at: community.created_at,
            updated_at: community.updated_at,
          },
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: false, message: err.message });
    }
  });
  

module.exports= router