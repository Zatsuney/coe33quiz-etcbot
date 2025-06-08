const { getGuildStats } = require('./stats.js');

function secondsToHMS(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

async function getActivityRanking(guildId) {
  const stats = await getGuildStats(guildId); // getGuildStats est asynchrone !
  const users = Object.entries(stats || {});

  // Classement par activité (messages + vocalTime pondéré)
  users.sort((a, b) => (b[1].messages + b[1].vocalTime / 60) - (a[1].messages + a[1].vocalTime / 60));

  return users.map(([userId, data], idx) => {
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