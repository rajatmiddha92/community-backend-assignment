const express=require('express');
const router= express.Router()
const authenticateToken = require('../authorization/auth');
const Community=require('../models/community')
const Role=require('../models/role')
const Member=require('../models/member')
const User=require('../models/user')

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
    const some=await Role.create({name:req.user.name,scopes:['Community Admin','Community Member']})
  

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

//get all members
  router.get('/v1/community/:id/members', authenticateToken, async (req, res) => {
    let { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    id=id.slice(1)
    try {
      // Find the community by id
      const community = await Community.find({name:id});
      if (!community.length) {
        return res.status(404).json({ status: false, message: 'Community not found.' });
      }
      
      const userIds = community.map(data => data.owner);
      const users = await User.find({ _id: { $in: userIds } })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      console.log(users)
  
      const rol = users.map(data => data.name);
      const role = await Role.find({ name: { $in : rol }});
      
      const totalMembers = await User.find({ _id: { $in: userIds } }).countDocuments();
      const totalPages = Math.ceil(totalMembers / limit);
  
      return res.status(200).json({
        status: true,
        content: {
          meta: {
            total: totalMembers,
            pages: totalPages,
            page: Number(page),
          },
          data: users.map((data) => ({
            id: data._id,
            community: community[0]._id,
            user: {
              id: data._id,
              name: data.name,
            },
            role: role.find(r => r.name === data.name)?.scopes || null,
            created_at: data.created_at,
          })),
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: false, message: err.message });
    }
  });
  

  //getMyownedCommunity
  router.get('/v1/community/me/owner', authenticateToken, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
      const communities = await Community.find({ owner: req.user.id })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ created_at: -1 })
        .exec();
  
      const count = await Community.countDocuments({ owner: req.user.id });
      
      if (!communities.length) {
        return res.status(404).json({ status: false, message: 'No communities found.' });
      }
  
      const meta = {
        total: count,
        pages: Math.ceil(count / limit),
        page: parseInt(page),
      };
  
      const data = communities.map((community) => ({
        id: community._id,
        name: community.name,
        slug: community.slug,
        owner: community.owner,
        created_at: community.created_at,
        updated_at: community.updated_at,
      }));
  
      return res.status(200).json({
        status: true,
        content: {
          meta,
          data,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: false, message: err.message });
    }
  });



  
  
  

module.exports= router