const express=require('express');
const router= express.Router()
const authenticateToken = require('../authorization/auth');
const Member = require('../models/member');
const Community = require('../models/community');
const Role = require('../models/role');
const User = require('../models/user');


//add members if user has certain permission
router.post('/v1/member', authenticateToken, async (req, res) => {
    try {
      const { community, user, role } = req.body;
  
      // Check if user is community admin
     
      const communityData = await Community.findById(community);
      const isAdmin = communityData.owner.toString() === req.user.id.toString();
      
      if (!isAdmin) {
        return res.status(403).json({
          status: false,
          errors: [{ message: "You are not authorized to perform this action.", code: "NOT_ALLOWED_ACCESS" }]
        });
      }
      
  
      // Check if user is already a member of the community
      const existingMember = await Member.findOne({ community, user });
      if (existingMember) {
        return res.status(400).json({
          status: false,
          errors: [{ message: "User is already added in the community.", code: "RESOURCE_EXISTS" }]
        });
      }
  
      // Check if community, user and role exist
      const [foundCommunityData, userData, roleData] = await Promise.all([
        Community.findById(community),
        User.findById(user),
        Role.findById(role)
      ]);
      if (!foundCommunityData) {
        return res.status(404).json({
          status: false,
          errors: [{ param: "community", message: "Community not found.", code: "RESOURCE_NOT_FOUND" }]
        });
      }
      if (!userData) {
        return res.status(404).json({
          status: false,
          errors: [{ param: "user", message: "User not found.", code: "RESOURCE_NOT_FOUND" }]
        });
      }
      if (!roleData) {
        return res.status(404).json({
          status: false,
          errors: [{ param: "role", message: "Role not found.", code: "RESOURCE_NOT_FOUND" }]
        });
      }
//check if role has scope of Community admin
   if(roleData.scopes.includes('Community Admin'))
   {
      // Create new member
      const member = new Member({ community, user, role });
      await member.save();
  
      // Return success response
      res.status(201).json({
        status: true,
        content: {
          data: {
            id: member._id,
            community: member.community,
            user: member.user,
            role: member.role,
            created_at: member.created_at
          }
        }
      });
    }
    else{
        return res.status(403).json({
            status: false,
            errors: [{ message: "You are not authorized to perform this action.", code: "NOT_ALLOWED_ACCESS" }]
          });
    }

    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        errors: [{ message: "Internal server error.", code: "INTERNAL_SERVER_ERROR" }]
      });
    }
  });
  
  
//delete member only if community admin or moderator

router.delete('/v1/member/:id', authenticateToken, async (req, res) => {
    try {
      // Check if the user is a community admin or moderator
      let {id}=req.params
      
      let deluser=await Member.findById(id)
      
      if (deluser && deluser.user!==req.user.id) {
        throw {
          status: false,
          errors: [
            {
              message: 'You are not authorized to remove users.',
              code: 'NOT_ALLOWED_ACCESS'
            }
          ]
        };
      }
  
      // Check if the member exists
      const memberId = req.params.id;
      const member = await Member.findById(memberId);
      if (!member) {
        throw {
          status: false,
          errors: [
            {
              message: 'Member not found.',
              code: 'RESOURCE_NOT_FOUND'
            }
          ]
        };
      }
      // Remove the member
      await Member.deleteOne({_id: memberId});
  
      // Return success response
      res.json({
        status: true,
        message: 'Member removed successfully.'
      });
    } catch (err) {
      // Handle errors
      res.status(400).json({err:err.message});
    }
  });





module.exports=router