const fs = require('fs');
const path = require('path');

const SCORE_FILE = path.join(__dirname, 'scores.json');

// Charge les scores depuis le fichier, ou initialise un objet vide
function loadScores() {
  if (fs.existsSync(SCORE_FILE)) {
    return JSON.parse(fs.readFileSync(SCORE_FILE, 'utf8'));
  }
  return {};
}

// Sauvegarde les scores dans le fichier
function saveScores(scores) {
  fs.writeFileSync(SCORE_FILE, JSON.stringify(scores, null, 2), 'utf8');
}

// Ajoute un point à l'utilisateur
function addPoint(guildId, userId, username) {
  const scores = loadScores();
  if (!scores[guildId]) scores[guildId] = {};
  if (!scores[guildId][userId]) {
    scores[guildId][userId] = { username, points: 0 };
  }
  scores[guildId][userId].points += 1;
  scores[guildId][userId].username = username;
  saveScores(scores);
}

// Récupère le classement
function getLeaderboard(guildId) {
  const scores = loadScores();
  if (!scores[guildId]) return [];
  // Ajoute l'userId dans chaque entrée pour pouvoir faire la recherche par ID
  return Object.entries(scores[guildId])
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
}

// Met à jour tous les pseudos à partir de la liste des membres du serveur
async function refreshUsernames(guild) {
  const scores = loadScores();
  for (const guildId of Object.keys(scores)) {
    for (const userId of Object.keys(scores[guildId])) {
      try {
        const member = await guild.members.fetch(userId);
        // Utilise le displayName (pseudo serveur) ou username (global)
        scores[guildId][userId].username = member.displayName || member.user.username;
      } catch (e) {
        // Si le membre n'est plus sur le serveur, on garde l'ancien pseudo
      }
    }
  }
  saveScores(scores);
}

// Supprime le score d'un utilisateur
function removeScore(guildId, userId) {
  const scores = loadScores();
  if (scores[guildId] && scores[guildId][userId]) {
    delete scores[guildId][userId];
    // Supprime le groupe si vide
    if (Object.keys(scores[guildId]).length === 0) {
      delete scores[guildId];
    }
    saveScores(scores);
  }
}

module.exports = { addPoint, getLeaderboard, refreshUsernames, removeScore };