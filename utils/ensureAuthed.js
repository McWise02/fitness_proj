// middleware/ensureOAuth.js
module.exports = function ensureOAuth(req, res, next) {
  const authed = req.isAuthenticated && req.isAuthenticated();
  if (authed) return next();

  // Redirect only for HTML page requests; return JSON 401 for XHR (like fetch from signup.html)
  const wantsHtml = req.accepts(['html', 'json']) === 'html';
  if (wantsHtml) {
    req.session.returnTo = req.originalUrl || '/';
    return res.redirect('/auth/github');
  }
  return res.status(401).json({ ok: false, needsAuth: true });
};
