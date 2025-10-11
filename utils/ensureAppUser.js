module.exports = function ensureAppUser(req, res, next) {
  if (req.session && req.session.userId) return next();
  req.session.returnTo = '/auth/complete-profile';
  return res.redirect('/auth/complete-profile');
};