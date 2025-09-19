const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Action = require('../models/Action');
const User = require('../models/User');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const config = require('../config');

/** admin: list pending actions */
router.get('/pending', auth, async (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({message:'forbidden'});
  const list = await Action.find({ approved: false }).populate('userId').populate('videoId');
  res.json(list);
});

/** admin: approve action(s) */
router.post('/approve', auth, async (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({message:'forbidden'});
  const { actionIds } = req.body; // array
  if(!Array.isArray(actionIds)) return res.status(400).json({message:'invalid'});
  const actions = await Action.find({ _id: { $in: actionIds }});
  const idsApproved = [];
  for(const a of actions){
    if(!a.approved){
      a.approved = true;
      await a.save();
      // credit user
      const u = await User.findById(a.userId);
      u.balance = (u.balance || 0) + config.CREDIT_PER_ACTION;
      await u.save();
      idsApproved.push(a._id);
    }
  }
  res.json({ approved: idsApproved });
});

/** admin: export balances CSV for manual payout */
router.get('/export-balances', auth, async (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({message:'forbidden'});
  const users = await User.find({ balance: { $gt: 0 }});
  const csvWriter = createCsvWriter({
    path: 'payouts.csv',
    header: [
      {id:'email', title:'email'},
      {id:'balance', title:'balance'},
      {id:'id', title:'userId'}
    ]
  });
  const records = users.map(u=> ({ email:u.email, balance: u.balance.toFixed(2), id: u._id.toString() }) );
  await csvWriter.writeRecords(records);
  res.download('payouts.csv');
});

module.exports = router;
