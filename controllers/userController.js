// controllers/userController.js
const path = require('path');
const bcrypt = require('bcryptjs');
const userDb = require('../database/userDb'); // <-- use DB layer

exports.afterGithubCallback = async (req, res) => {
  try {
    const githubId = req.user?.id;
    const emailFromGithub = Array.isArray(req.user?.emails) && req.user.emails[0]?.value
      ? req.user.emails[0].value
      : null;
    const avatarUrl = req.user?.avatar;

    const appUser = await userDb.ensureLinkedFromGithub({
      githubId,
      email: emailFromGithub,
      avatarUrl,
    });

    if (!appUser) {
      req.session.returnTo = '/auth/complete-profile';
      return res.redirect('/auth/complete-profile');
    }

    req.session.userId = appUser._id.toString();

    const dest =
      (req.session && req.session.returnTo && /^\/(?!\/)/.test(req.session.returnTo))
        ? req.session.returnTo
        : '/api-docs';

    if (req.session) delete req.session.returnTo;
    return res.redirect(dest);
  } catch (err) {
    console.error('afterGithubCallback error:', err);
    return res.redirect('/auth/failure');
  }
};

exports.renderSignup = (req, res) => {
  const filePath = path.join(__dirname, '..', 'views/account', 'signup.html');
  res.sendFile(filePath);
};

exports.me = (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ ok: false });
  }
  const { id, username, displayName, avatar, emails } = req.user || {};
  return res.status(200).json({ ok: true, user: { id, username, displayName, avatar, emails } });
};

exports.completeProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      goals,
      preferredWorkoutTimes,
      city,
      country,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send('Missing required fields');
    }

    // security work stays in controller
    const passwordHash = await bcrypt.hash(password, 12);

    const goalsArr = (goals || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const pwt =
      preferredWorkoutTimes && ['morning', 'afternoon', 'evening'].includes(preferredWorkoutTimes)
        ? [preferredWorkoutTimes]
        : [];

    const userDoc = await userDb.upsertFromProfileCompletion({
      firstName,
      lastName,
      email,
      passwordHash,
      goals: goalsArr,
      preferredWorkoutTimes: pwt,
      city,
      country,
      githubId: req.user?.id,
      avatarUrl: req.user?.avatar,
    });

    req.session.userId = userDoc._id.toString();
    return res.redirect('/api-docs');
  } catch (err) {
    console.error('completeProfile error:', err);
    return res.status(500).send('Failed to save profile');
  }
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ ok: false, error: 'Logout failed' });
    req.session.destroy(() => {
      res.clearCookie('sessionId');
      res.json({ ok: true });
    });
  });
};


exports.afterGithubCallback = async (req, res) => {
  try {
    // ... your linking logic ...
    const dest = (req.session && req.session.returnTo && /^\/(?!\/)/.test(req.session.returnTo))
      ? req.session.returnTo
      : '/auth/complete-profile'; // or '/api-docs' if you prefer

    if (req.session) delete req.session.returnTo;

    // ✅ ensure the session (and Set-Cookie) is flushed before redirect
    req.session.save(() => res.redirect(dest));
  } catch (e) {
    console.error(e);
    res.redirect('/auth/failure');
  }
};

