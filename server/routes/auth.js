const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

function genToken(user) {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, config.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req,res)=>{
  try{
    const { email, password, displayName } = req.body;
    if(!email || !password) return res.status(400).json({message:'Missing'});
    const exists = await User.findOne({email});
    if(exists) return res.status(400).json({message:'Email in use'});
    const hash = await bcrypt.hash(password, 10);
    const u = new User({email, passwordHash: hash, displayName});
    if(email === config.ADMIN_EMAIL) u.role = 'admin';
    await u.save();
    const token = genToken(u);
    res.json({ token, user: { email: u.email, balance: u.balance, role: u.role, id: u._id } });
  }catch(e){
    console.error(e); res.status(500).json({message:'err'});
  }
});

router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if(!u) return res.status(400).json({message:'Invalid'});
    const ok = await bcrypt.compare(password, u.passwordHash);
    if(!ok) return res.status(400).json({message:'Invalid'});
    const token = genToken(u);
    res.json({ token, user: { email: u.email, balance: u.balance, role: u.role, id: u._id } });
  }catch(e){
    console.error(e); res.status(500).json({message:'err'});
  }
});

module.exports = router;
