const jwt=require('jsonwebtoken');
const express=require('express');


const   verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ msg: 'No auth token access denied' });
    }
  
    try {
      const verified = jwt.verify(token, 'passwordKey');
      req.user = verified.id;
      req.token = token;
      next();
    } catch (error) {
      return res.status(401).json({ msg: 'Token verification failed, authorization denied' });
    }
  };
  

module.exports =verifyToken;