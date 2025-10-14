// middleware/ensureAppUser.js
const mongoose = require('mongoose');
const userDb = require('../database/userDb'); // adjust path if needed

module.exports = async function ensureAppUser(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return handleNeedsProfile(req, res);
    }

    const userId = String(req.session.userId);

    // Look up the user in DB
    const user = await userDb.getById(userId); 
    if (!user) {

      return handleNeedsProfile(req, res);
    }


    req.user = user;
    return next();
  } catch (err) {
    return next(err); 
  }
};

function handleNeedsProfile(req, res) {
  const wantsHtml = req.accepts(['html', 'json']) === 'html';
  // Remember where they were trying to go so you can send them back after completion
  req.session && (req.session.returnTo = req.originalUrl || '/');

  if (wantsHtml) {
    return res.redirect('/auth/complete-profile');
  }
  return res
    .status(401)
    .json({ ok: false, needsProfile: true, next: '/auth/complete-profile' });
}
