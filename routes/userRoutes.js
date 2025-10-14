// routes/userRoutes.js
const express = require('express');
const passport = require('passport');

const ensureUser = require('../utils/ensureAppUser');
const ensureAuthed = require('../utils/ensureAuthed');
const userCtrl = require('../controllers/userController');

const router = new express.Router();

// Start GitHub auth (remember returnTo if provided)
router.get(
  '/github',
  (req, _res, next) => {
    if (req.query.returnTo) req.session.returnTo = req.query.returnTo;
    next();
  },
  passport.authenticate('github', { scope: ['read:user', 'user:email'] })
);

// GitHub callback → controller decides redirect (form or /api-docs)
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/failure' }),
  userCtrl.afterGithubCallback
);

// Serve signup HTML (must be authed with GitHub session)
router.get('/complete-profile', ensureAuthed, userCtrl.renderSignup);

// Prefill data endpoint for signup.html
router.get('/me', ensureAuthed, userCtrl.me);

// Save profile → create/update User → redirect /api-docs
router.post('/complete-profile', ensureAuthed, userCtrl.completeProfile);

// Status & logout
router.get('/success', (req, res) => res.status(200).json({ ok: true, user: req.user || null }));
router.get('/failure', (_req, res) => res.status(401).json({ ok: false, message: 'GitHub authentication failed' }));
router.post('/logout', userCtrl.logout);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
