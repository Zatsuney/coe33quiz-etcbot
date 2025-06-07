const fs = require('fs');
const path = require('path');
const statsFile = path.join(__dirname, 'stats.json');

function loadStats() {
  if (!fs.existsSync(statsFile)) return {};
  return JSON.parse(fs.readFileSync(statsFile));
}

function saveStats(stats) {
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
}

function ensureGuild(stats, guildId) {
  if (!stats[guildId]) stats[guildId] = { users: {} };
}

function incrementUserMessage(guildId, userId, channelId) {
  const stats = loadStats();
  ensureGuild(stats, guildId);
  if (!stats[guildId].users[userId]) stats[guildId].users[userId] = { messages: 0, vocalTime: 0, lastJoin: null, channels: {} };
  stats[guildId].users[userId].messages++;
  if (channelId) {
    stats[guildId].users[userId].channels[channelId] = (stats[guildId].users[userId].channels[channelId] || 0) + 1;
  }
  saveStats(stats);
}

function getUserMessages(guildId, userId) {
  const stats = loadStats();
  return stats[guildId]?.users[userId]?.messages || 0;
}

function userJoinVocal(guildId, userId) {
  const stats = loadStats();
  ensureGuild(stats, guildId);
  if (!stats[guildId].users[userId]) stats[guildId].users[userId] = { messages: 0, vocalTime: 0, lastJoin: null, channels: {} };
  stats[guildId].users[userId].lastJoin = Date.now();
  saveStats(stats);
}

function userLeaveVocal(guildId, userId) {
  const stats = loadStats();
  if (!stats[guildId]?.users[userId] || !stats[guildId].users[userId].lastJoin) return;
  const now = Date.now();
  const duration = Math.floor((now - stats[guildId].users[userId].lastJoin) / 1000);
  stats[guildId].users[userId].vocalTime = (stats[guildId].users[userId].vocalTime || 0) + duration;
  stats[guildId].users[userId].lastJoin = null;
  saveStats(stats);
}

function getUserVocalTime(guildId, userId) {
  const stats = loadStats();
  return stats[guildId]?.users[userId]?.vocalTime || 0;
}

function getUserStats(guildId, userId) {
  const stats = loadStats();
  return stats[guildId]?.users[userId] || null;
}

function getGuildStats(guildId) {
  const stats = loadStats();
  return stats[guildId]?.users || {};
}

function resetUserStats(guildId, userId) {
  const stats = loadStats();
  if (stats[guildId]?.users[userId]) {
    delete stats[guildId].users[userId];
    saveStats(stats);
    return true;
  }
  return false;
}

function resetAllStats(guildId) {
  const stats = loadStats();
  if (stats[guildId]) {
    stats[guildId].users = {};
    saveStats(stats);
    return true;
  }
  return false;
}

module.exports = {
  incrementUserMessage,
  getUserMessages,
  loadStats,
  saveStats,
  userJoinVocal,
  userLeaveVocal,
  getUserVocalTime,
  getUserStats,
  getGuildStats,
  resetUserStats,
  resetAllStats,
};