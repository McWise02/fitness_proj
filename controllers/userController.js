
const path = require('path');
const bcrypt = require('bcryptjs');
const userDb = require('../database/userDb'); 


exports.afterGithubCallback = async (req, res) => {
  try {
    const githubId = req.user?.id; // passport-github2 puts the GitHub id here
    if (!githubId) return res.redirect('/auth/failure');

    console.log("Github ID:", githubId);



    let user = await userDb.findByGithubId(githubId);
    if (!user) {
      req.session.githubId = githubId;
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

exports.renderSignup = async (req, res) => {
    try {
      const filePath = path.join(__dirname, '..', 'views/account', 'signup.html');
      res.sendFile(filePath);
    } catch (e) {
      next(e);
    }
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

    const githubId = req.session?.githubId
    console.log("Github ID from session:", githubId);



    if ((!firstName || !lastName || !email || !password)) {
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

    userDoc = await userDb.upsertFromProfileCompletion({
      firstName, lastName, email,
      passwordHash,
      goals: goalsArr,
      preferredWorkoutTimes: pwt,
      city, country,
      githubId: githubId ?? undefined,
      // If you want to carry githubId/avatar from a prior step, store them in session earlier
      avatarUrl: req.session?.avatarUrl ?? undefined,
    });

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

exports.updateMeByGithubId = async (req, res) => {
  try {
    const githubId = req.session.passport?.user.id; 
    if (!githubId) {
      return res.status(401).json({ error: 'Not authenticated (missing githubId in session).' });
    }

    const {
      firstName,
      lastName,
      email,
      goals,
      preferredWorkoutTimes,
      city,
      country,
      avatarUrl,
      // passwordHash // usually NOT updated here — leave out unless you have a separate flow
    } = req.body || {};

    const patch = {
      firstName,
      lastName,
      email,
      goals,
      preferredWorkoutTimes,
      city,
      country,
      avatarUrl,
    };

    const updated = await userDb.updateUserByGithubId(githubId, patch);
    if (!updated) return res.status(404).json({ error: 'User not found for this githubId.' });

    return res.json(safeUser(updated));
  } catch (err) {
    console.error('updateMeByGithubId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



