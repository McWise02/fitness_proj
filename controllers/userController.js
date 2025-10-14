
const path = require('path');
const bcrypt = require('bcryptjs');
const userDb = require('../database/userDb'); 

// controllers/authController.js
exports.afterGithubCallback = async (req, res) => {
  try {
    const githubId = req.user?.id; // passport-github2 puts the GitHub id here
    if (!githubId) return res.redirect('/auth/failure');

    const emailFromGithub =
      Array.isArray(req.user?.emails) && req.user.emails[0]?.value
        ? req.user.emails[0].value
        : null;

    const avatarUrl =
      req.user?.photos?.[0]?.value ||
      req.user?.avatarUrl ||
      null;

    // 1) If there's already a logged-in app user, link GitHub to that account
    if (req.session?.userId) {
      const currentUserId = String(req.session.userId);
      // upsert/link githubId to the existing user (no-op if already linked)
      const linked = await userDb.linkGithubToUser(currentUserId, {
        githubId,
        email: emailFromGithub,
        avatarUrl,
      });

      if (!linked) {
        console.log('No user found to link; redirecting to complete-profile');
        return res.redirect('/auth/complete-profile');} 

      req.session.userId = linked._id.toString();
      const dest = (req.session.returnTo && /^\/(?!\/)/.test(req.session.returnTo))
        ? req.session.returnTo
        : '/api-docs';
      if (req.session.returnTo) delete req.session.returnTo;
      return res.redirect(dest);
    }

    // 2) No existing session: try to find a user by githubId
    let user = await userDb.findByGithubId(githubId);
    if (!user) {
      // create or link by email if possible
      user = await userDb.ensureLinkedFromGithub({
        githubId,
        email: emailFromGithub,
        avatarUrl,
        profile: req.user, // optional, if your DB helper uses it
      });
    }

    if (!user) {
      console.log('No user found or created; redirecting to complete-profile');
      if (req.session) req.session.returnTo = '/auth/complete-profile';
      return res.redirect('/auth/complete-profile');
    }

    req.session.userId = user._id.toString();

    const dest = (req.session?.returnTo && /^\/(?!\/)/.test(req.session.returnTo))
      ? req.session.returnTo
      : '/api-docs';
    if (req.session?.returnTo) delete req.session.returnTo;

    return res.redirect(dest);
  } catch (err) {
    console.error('afterGithubCallback error:', err);
    return res.redirect('/auth/failure');
  }
};


exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;



    const deleted = await userDb.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 204 if you don't want a body; using 200 with a message is also fine
    return res.status(200).json({ message: 'User deleted', id });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting user', error: err.message });
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
      firstName, lastName, email, password,
      goals, preferredWorkoutTimes, city, country,
    } = req.body;


    const sessionUserId = req.session?.userId;
    const hasValidSessionId = mongoose.isValidObjectId(sessionUserId);


    if (!hasValidSessionId && (!firstName || !lastName || !email || !password)) {
      return res.status(400).send('Missing required fields');
    }

  
    const goalsArr = (goals ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const pwt = (
      ['morning','afternoon','evening'].includes(preferredWorkoutTimes)
        ? [preferredWorkoutTimes] : []
    );


    const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;

    let userDoc;
    if (hasValidSessionId) {
      // Update the existing user
      userDoc = await userDb.updateProfile(sessionUserId, {
        firstName, lastName, email, city, country,
        goals: goalsArr,
        preferredWorkoutTimes: pwt,
        ...(passwordHash ? { passwordHash } : {}),
      });
    } else {

      userDoc = await userDb.upsertFromProfileCompletion({
        firstName, lastName, email,
        passwordHash,
        goals: goalsArr,
        preferredWorkoutTimes: pwt,
        city, country,
        // If you want to carry githubId/avatar from a prior step, store them in session earlier
        githubId: req.session?.githubId ?? undefined,
        avatarUrl: req.session?.avatarUrl ?? undefined,
      });
    }

    if (!userDoc) {
      return res.status(500).send('Failed to save profile');
    }

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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userDb.getAll();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    
    const user = await userDb.getById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
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

