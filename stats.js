const fs = require('fs');
const path = require('path');
const statsFile = path.join(__dirname, 'stats.json');

function loadStats() {
  if (!fs.existsSync(statsFile)) return { users: {} };
  return JSON.parse(fs.readFileSync(statsFile));
}

function saveStats(stats) {
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
}

function incrementUserMessage(userId) {
  const stats = loadStats();
  if (!stats.users[userId]) stats.users[userId] = { messages: 0, vocalTime: 0, lastJoin: null };
  stats.users[userId].messages++;
  saveStats(stats);
}

function getUserMessages(userId) {
  const stats = loadStats();
  return stats.users[userId]?.messages || 0;
}

// Ajout pour le vocal :
function userJoinVocal(userId) {
  const stats = loadStats();
  if (!stats.users[userId]) stats.users[userId] = { messages: 0, vocalTime: 0, lastJoin: null };
  stats.users[userId].lastJoin = Date.now();
  saveStats(stats);
}

function userLeaveVocal(userId) {
  const stats = loadStats();
  if (!stats.users[userId] || !stats.users[userId].lastJoin) return;
  const now = Date.now();
  const duration = Math.floor((now - stats.users[userId].lastJoin) / 1000); // en secondes
  stats.users[userId].vocalTime = (stats.users[userId].vocalTime || 0) + duration;
  stats.users[userId].lastJoin = null;
  saveStats(stats);
}

function getUserVocalTime(userId) {
  const stats = loadStats();
  return stats.users[userId]?.vocalTime || 0;
}

module.exports = {
  incrementUserMessage,
  getUserMessages,
  loadStats,
  saveStats,
  userJoinVocal,
  userLeaveVocal,
  getUserVocalTime
};