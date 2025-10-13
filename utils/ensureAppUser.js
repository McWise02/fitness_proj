// middleware/ensureAppUser.js
module.exports = function ensureAppUser(req, res, next) {
  if (req.session && req.session.userId) return next();

  const wantsHtml = req.accepts(['html','json']) === 'html';
  if (wantsHtml) {
    req.session.returnTo = '/auth/complete-profile';
    return res.redirect('/auth/complete-profile');
  }
  return res.status(401).json({ ok: false, needsProfile: true, next: '/auth/complete-profile' });
};
