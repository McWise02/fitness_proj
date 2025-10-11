// utils/ensureAuthed.js
module.exports = function ensureAuthed(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  req.session.returnTo = '/auth/complete-profile';
  return res.redirect('/auth/github');
};
