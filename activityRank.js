const { loadStats } = require('./stats.js');

function secondsToHMS(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function getActivityRanking() {
  const stats = loadStats();
  const users = Object.entries(stats.users || {});

  // Classement par activité (messages + vocalTime pondéré, ici 1 message = 60s de vocal)
  users.sort((a, b) => (b[1].messages + b[1].vocalTime / 60) - (a[1].messages + a[1].vocalTime / 60));

  // Trouver le channel le plus utilisé pour chaque utilisateur
  const channelStats = stats.channels || {};

  return users.map(([userId, data], idx) => {
    // Trouver le channel le plus utilisé par cet utilisateur
    let topChannel = null;
    let topCount = 0;
    if (data.channels) {
      for (const [chan, count] of Object.entries(data.channels)) {
        if (count > topCount) {
          topChannel = chan;
          topCount = count;
        }
      }
    }
    return {
      rank: idx + 1,
      userId,
      messages: data.messages || 0,
      vocalTime: data.vocalTime || 0,
      topChannel
    };
  });
}

module.exports = { getActivityRanking, secondsToHMS };