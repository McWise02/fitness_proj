// database/userDb.js
const User = require('../models/User');


const normalizeEmail = (v) =>
  typeof v === 'string' ? v.trim().toLowerCase() : v;


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
  console.log(id);
  if (!id) return null;
  return await User.findById(id).exec();
}


async function findByGithubOrEmail(githubId, email) {
  const gh = await findByGithubId(githubId);
  if (gh) return gh;
  return await findByEmail(email);
}

async function linkGithubToUser(userId, { githubId, avatarUrl }) {
  if (!userId || !githubId) return null;
  const update = { githubId };
  if (avatarUrl) update.avatarUrl = avatarUrl;
  return await User.findByIdAndUpdate(userId, update, { new: true }).exec();
}

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

async function deleteById(id) {
  // Returns the deleted doc (or null if not found)
  return User.findByIdAndDelete(id);
}

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

async function getById(id) {
  console.log(id);
  return User.findOne({ _id: id }).lean();
}

async function getAll() {
  return User.find().lean();
}

module.exports = {
  getById,
  getAll,
  deleteById,
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
