const express=require('express');
const router= express.Router()
const Role=require('../models/role')

//api to assign role to a particular user
router.post('/v1/role',async(req,res)=>{
    let {name}=req.body
    try{
    let data=await Role.create({name})
    res.status(201).json({status:true,content:{data}})
    }
    catch(err){
        res.status(400).json({status:false,err:err.message})
    }

})

//api to get all data of all roles
router.get('/v1/role', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    try {
      const total = await Role.countDocuments();
      const totalPages = Math.ceil(total / perPage);
      const roles = await Role.find().skip((page - 1) * perPage).limit(perPage);
      const data = roles.map(role => ({
        id: role._id,
        name: role.name,
        scopes: role.scopes,
        created_at: role.created_at,
        updated_at: role.updated_at
      }));
  
      res.json({
        status: true,
        content: {
          meta: {
            total,
            pages: totalPages,
            page
          },
          data
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });




module.exports= router