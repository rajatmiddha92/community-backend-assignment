const express=require('express');
const router= express.Router()
const Role=require('../models/role')

//api to assign role to a particular user
const Validator = require('validatorjs');

router.post('/v1/role', async (req, res) => {
  const validationRules = {
    name: 'required|min:2',
  };
  const validation = new Validator(req.body, validationRules);
  
  if (validation.fails()) {
    const errors = validation.errors.all();
    const formattedErrors = Object.keys(errors).map((key) => {
      return {
        param: key,
        message: errors[key][0],
        code: 'INVALID_INPUT',
      };
    });
    return res.status(400).json({ status: false, errors: formattedErrors });
  }

  try {
    const { name } = req.body;
    const data = await Role.create({ name });
    res.status(201).json({ status: true, content: { data } });
  } catch (err) {
    res.status(400).json({ status: false, errors: [{ message: err.message }] });
  }
});


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