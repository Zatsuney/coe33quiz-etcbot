const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

const GAME_ID = 'ldew5jnd';
// Remplace par l'ID réel de la catégorie Any% trouvé via l'API
const ANY_PERCENT_CATEGORY_ID = 'jdzjy63k';

async function getTopRuns() {
  let url = `https://www.speedrun.com/api/v1/runs?game=${GAME_ID}&category=${ANY_PERCENT_CATEGORY_ID}&status=verified&orderby=time&direction=asc&embed=players,category`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
    return [];
  }

  // On récupère les 3 meilleurs temps
  const runs = data.data.slice(0, 3).map(run => {
    const player = run.players.data[0]?.names?.international || run.players.data[0]?.name || 'Inconnu';
    const time = run.times.primary_t;
    const categoryName = run.category.data?.name || 'Catégorie inconnue';
    return {
      player,
      time,
      category: categoryName,
      video: run.videos?.links?.[0]?.uri || null
    };
  });

  return runs;
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
}

module.exports = { getTopRuns, formatTime };