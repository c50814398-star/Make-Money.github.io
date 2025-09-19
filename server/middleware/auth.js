const jwt = require('jsonwebtoken');
const config = require('../config');

function authMiddleware(req,res,next){
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if(!token) return res.status(401).json({message:'Unauthorized'});
  try{
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){
    res.status(401).json({message:'Token invalid'});
  }
}

module.exports = authMiddleware;
