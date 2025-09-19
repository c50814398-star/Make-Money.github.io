const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// list public videos
router.get('/', async (req,res)=>{
  const videos = await Video.find().sort({createdAt:-1});
  res.json(videos);
});

// add video (admin)
router.post('/', auth, async (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({message:'forbidden'});
  const { url, title } = req.body;
  const v = new Video({ url, title });
  await v.save();
  res.json(v);
});

module.exports = router;
