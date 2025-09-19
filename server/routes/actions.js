const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Action = require('../models/Action');
const Video = require('../models/Video');
const User = require('../models/User');
const auth = require('../middleware/auth');
const config = require('../config');

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/'); },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'));
  }
});
const upload = multer({ storage });

/**
 * Submit an action: user posts { videoId, type, proofUrl } and optional image upload
 * - lightweight verification: ensures user hasn't already claimed same action for this video
 * - Marks approved=false by default (admin review)
 */
router.post('/submit', auth, upload.single('proofImg'), async (req,res)=>{
  try{
    const { videoId, type, proofUrl } = req.body;
    if(!videoId || !type) return res.status(400).json({message:'missing'});
    const allowed = ['watched','liked','commented','shared'];
    if(!allowed.includes(type)) return res.status(400).json({message:'invalid type'});

    const video = await Video.findById(videoId);
    if(!video) return res.status(404).json({message:'video not found'});

    // prevent duplicate same action for same user+video
    const existing = await Action.findOne({ userId: req.user.id, videoId, type });
    if(existing) return res.status(400).json({message:'Action already submitted'});

    const a = new Action({
      userId: req.user.id,
      videoId,
      type,
      proofUrl: proofUrl || undefined,
      proofImg: req.file ? ('/uploads/'+req.file.filename) : undefined,
      approved: false
    });

    await a.save();

    // Optionally: auto-approve 'watched' actions (lightweight), add balance
    if(type === 'watched'){
      // small anti-fraud: only auto-approve if user hasn't submitted many watched actions quickly.
      const countRecent = await Action.countDocuments({userId:req.user.id, type:'watched', createdAt:{$gt: new Date(Date.now() - 1000*60*60)}}); // last 1 hour
      if(countRecent < 10){
        a.approved = true;
        await a.save();
        // credit user
        const u = await User.findById(req.user.id);
        u.balance = (u.balance || 0) + config.CREDIT_PER_ACTION;
        await u.save();
      }
    }

    res.json({ message: 'submitted', action: a });
  }catch(e){
    console.error(e); res.status(500).json({message:'err'});
  }
});

/** Get my actions */
router.get('/mine', auth, async (req,res)=>{
  const actions = await Action.find({userId: req.user.id}).populate('videoId');
  res.json(actions);
});

module.exports = router;
