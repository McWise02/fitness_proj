// utils/ensureAuthed.js
module.exports = function ensureAuthed(req, res, next) {
  if (req.session && req.session.userId) return next();
  // Not logged in or hasn’t completed profile
  req.session.returnTo = '/auth/complete-profile';
  return res.redirect('/auth/github');
};
