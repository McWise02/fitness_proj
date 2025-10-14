// middleware/ensureAppUser.js
const mongoose = require('mongoose');
const userDb = require('../database/userDb');
const { isProfileComplete } = require('../utils/profile');

module.exports = async function ensureAppUser(req, res, next) {
  try {
    const id = req.session?.userId;
    if (!id) {
      return redirectToAuth(req, res);
    }

    const user = await userDb.getById(id); // lean object
    if (!user) return redirectToAuth(req, res);

    req.user = user;                // treat as authorized
    return next();
    }catch (err) {
    next(err);
  }
};

function redirectToAuth(req, res) {
  // save intended URL for later
  if (req.session) req.session.returnTo = req.originalUrl || '/api-docs';
  const wantsHtml = req.accepts(['html','json']) === 'html';
  return wantsHtml
    ? res.redirect('/auth/github')    // or your login route
    : res.status(401).json({ ok:false, next:'/auth/github' });
}

function redirectToCompleteProfile(req, res) {
  if (req.session) req.session.returnTo = req.originalUrl || '/api-docs';
  const wantsHtml = req.accepts(['html','json']) === 'html';
  return wantsHtml
    ? res.redirect('/auth/complete-profile')
    : res.status(401).json({ ok:false, needsProfile:true, next:'/auth/complete-profile' });
}
