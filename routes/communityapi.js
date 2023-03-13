const express=require('express');
const router= express.Router()
const authenticateToken = require('../authorization/auth');
const Community=require('../models/community')
const Role=require('../models/role')
const Member=require('../models/member')

//create community api
router.post('/v1/community', authenticateToken, async (req, res) => {
    const { name } = req.body;
  
    // Check if name is provided
    if (!name) {
      return res.status(400).json({ status: false, message: 'Community name is required.' });
    }
    
    const exist=await Community.findOne({name})

    if(exist)
    {
        return res.status(400).json({ status: false, message: 'Community already exist'})
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

    console.log(req.user.name)
    const some=await Role.create({name:req.user.name,scopes:['Community Admin']})
  

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
  

  
  //get all data with pagination
  router.get('/v1/community', async (req, res) => {
    const perPage = 10;
    const page = parseInt(req.query.page) || 1;
  
    const communities = await Community.find()
      .populate('owner', 'id name')
      .limit(perPage)
      .skip((page - 1) * perPage);
  
    const totalCommunities = await Community.countDocuments();
  
    const totalPages = Math.ceil(totalCommunities / perPage);
  
    res.status(200).json({
      status: true,
      content: {
        meta: {
          total: totalCommunities,
          pages: totalPages,
          page,
        },
        data: communities.map((community) => ({
          id: community._id,
          name: community.name,
          slug: community.slug,
          owner: community.owner,
          created_at: community.created_at,
          updated_at: community.updated_at,
        })),
      },
    });
  });


  router.get('/v1/community/:id/members', authenticateToken, async (req, res) => {
    let { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
      id=id.slice(1)
    try {
      // Find the community by id
      const community = await Community.find({name:id});
      console.log(community)
      if (!community.length) {
        return res.status(404).json({ status: false, message: 'Community not found.' });
      }
  
      // Count the number of community members
      const total = await Member.countDocuments({ community });
  
      // Get the community members with pagination
      const members = await Member.find({ community })
        .populate('user', 'id name')
        .populate('role', 'id name')
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      // Calculate the total number of pages
      const pages = Math.ceil(total / limit);
  
      return res.status(200).json({
        status: true,
        content: {
          meta: {
            total,
            pages,
            page: Number(page),
          },
          data: members.map((member) => ({
            id: member.id,
            community: member.community,
            user: member.user,
            role: member.role,
            created_at: member.created_at,
          })),
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: false, message: err.message });
    }
  });
  

module.exports= router