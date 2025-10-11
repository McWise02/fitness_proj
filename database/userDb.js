// database/userDb.js
const User = require('../models/User');

// ---------- helpers ----------
const normalizeEmail = (v) =>
  typeof v === 'string' ? v.trim().toLowerCase() : v;

// ---------- reads ----------
async function findByGithubId(githubId) {
  if (!githubId) return null;
  return await User.findOne({ githubId }).exec();
}

async function findByEmail(email) {
  const em = normalizeEmail(email);
  if (!em) return null;
  return await User.findOne({ email: em }).exec();
}

async function findById(id) {
  if (!id) return null;
  return await User.findById(id).exec();
}

/**
 * Try GitHub first, then email.
 * If found by email and a githubId is provided, caller can link with linkGithubToUser().
 */
async function findByGithubOrEmail(githubId, email) {
  const gh = await findByGithubId(githubId);
  if (gh) return gh;
  return await findByEmail(email);
}

// ---------- mutations ----------
/** Attach githubId (+ optional avatarUrl) to an existing user by _id. */
async function linkGithubToUser(userId, { githubId, avatarUrl }) {
  if (!userId || !githubId) return null;
  const update = { githubId };
  if (avatarUrl) update.avatarUrl = avatarUrl;
  return await User.findByIdAndUpdate(userId, update, { new: true }).exec();
}

/**
 * Ensure a user exists/linked after GitHub OAuth:
 * 1) If user with githubId exists → return it
 * 2) Else if user with email exists → link githubId (+ avatar) and return it
 * 3) Else → return null (caller should redirect to profile completion)
 */
async function ensureLinkedFromGithub({ githubId, email, avatarUrl }) {
  const byGh = await findByGithubId(githubId);
  if (byGh) return byGh;

  const byEmail = await findByEmail(email);
  if (byEmail) {
    if (!byEmail.githubId && githubId) byEmail.githubId = githubId;
    if (avatarUrl && !byEmail.avatarUrl) byEmail.avatarUrl = avatarUrl;
    await byEmail.save();
    return byEmail;
  }

  return null;
}

/**
 * Upsert from profile completion form.
 * - If a user with email exists → update fields.
 * - Else → create new.
 * Expects passwordHash already computed by the controller (no hashing here).
 */
async function upsertFromProfileCompletion({
  firstName,
  lastName,
  email,
  passwordHash,
  goals = [],
  preferredWorkoutTimes = [],
  city,
  country,
  githubId,
  avatarUrl,
}) {
  const em = normalizeEmail(email);
  let doc = await User.findOne({ email: em }).exec();

  const base = {
    firstName: firstName?.trim(),
    lastName: lastName?.trim(),
    email: em,
    passwordHash,
    goals,
    preferredWorkoutTimes,
    city: city?.trim() || undefined,
    country: country?.trim() || undefined,
    role: 'user',
  };

  if (githubId) base.githubId = githubId;
  if (avatarUrl) base.avatarUrl = avatarUrl;

  if (doc) {
    doc.set(base);
    await doc.save();
    return doc;
  }

  doc = await User.create(base);
  return doc;
}

module.exports = {
  // reads
  findById,
  findByEmail,
  findByGithubId,
  findByGithubOrEmail,

  // mutations
  linkGithubToUser,
  ensureLinkedFromGithub,
  upsertFromProfileCompletion,
};
