const admin = require('firebase-admin');
const db = admin.firestore();

// Incrémente le nombre de messages et le channel utilisé
async function incrementUserMessage(guildId, userId, channelId) {
  const ref = db.collection('guilds').doc(guildId).collection('users').doc(userId);
  const doc = await ref.get();
  let data = doc.exists ? doc.data() : { messages: 0, vocalTime: 0, lastJoin: null, channels: {} };
  data.messages = (data.messages || 0) + 1;
  data.channels[channelId] = (data.channels[channelId] || 0) + 1;
  await ref.set(data);
}

// Récupère le nombre de messages d'un utilisateur
async function getUserMessages(guildId, userId) {
  const ref = db.collection('guilds').doc(guildId).collection('users').doc(userId);
  const doc = await ref.get();
  return doc.exists ? (doc.data().messages || 0) : 0;
}

// Marque l'entrée en vocal (stocke le timestamp)
async function userJoinVocal(guildId, userId) {
  const ref = db.collection('guilds').doc(guildId).collection('users').doc(userId);
  const doc = await ref.get();
  let data = doc.exists ? doc.data() : { messages: 0, vocalTime: 0, lastJoin: null, channels: {} };
  data.lastJoin = Date.now();
  await ref.set(data);
}

// Calcule le temps passé en vocal et remet lastJoin à null
async function userLeaveVocal(guildId, userId) {
  const ref = db.collection('guilds').doc(guildId).collection('users').doc(userId);
  const doc = await ref.get();
  if (!doc.exists || !doc.data().lastJoin) return;
  let data = doc.data();
  const now = Date.now();
  const duration = Math.floor((now - data.lastJoin) / 1000);
  data.vocalTime = (data.vocalTime || 0) + duration;
  data.lastJoin = null;
  await ref.set(data);
}

// Récupère le temps passé en vocal
async function getUserVocalTime(guildId, userId) {
  const ref = db.collection('guilds').doc(guildId).collection('users').doc(userId);
  const doc = await ref.get();
  return doc.exists ? (doc.data().vocalTime || 0) : 0;
}

// Récupère toutes les stats d'un utilisateur
async function getUserStats(guildId, userId) {
  const ref = db.collection('guilds').doc(guildId).collection('users').doc(userId);
  const doc = await ref.get();
  return doc.exists ? doc.data() : null;
}

// Récupère toutes les stats du serveur (objet userId => stats)
async function getGuildStats(guildId) {
  const snapshot = await db.collection('guilds').doc(guildId).collection('users').get();
  const users = {};
  snapshot.forEach(doc => {
    users[doc.id] = doc.data();
  });
  return users;
}

// Reset les stats d'un utilisateur
async function resetUserStats(guildId, userId) {
  const ref = db.collection('guilds').doc(guildId).collection('users').doc(userId);
  const doc = await ref.get();
  if (doc.exists) {
    await ref.delete();
    return true;
  }
  return false;
}

// Reset toutes les stats du serveur
async function resetAllStats(guildId) {
  const usersRef = db.collection('guilds').doc(guildId).collection('users');
  const snapshot = await usersRef.get();
  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  return true;
}

module.exports = {
  incrementUserMessage,
  getUserMessages,
  userJoinVocal,
  userLeaveVocal,
  getUserVocalTime,
  getUserStats,
  getGuildStats,
  resetUserStats,
  resetAllStats,
};