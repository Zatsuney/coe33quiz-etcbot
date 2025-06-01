const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

const GAME_ID = 'ldew5jnd';
const ANY_PERCENT_CATEGORY_ID = 'jdzjy63k';

// Variables et valeurs pour le filtre
const VAR_PLATFORM = '68kvy1z8';
const VAL_PC = '5q8ypryl';
const VAR_NG = '10v3yypl';
const VAL_NG = 'mln6e0nl';
const VAR_DIFFICULTY = 'e8mgpge8';
const VAL_STORY = 'zd3qj9k1';

async function getTopRuns() {
  let url = `https://www.speedrun.com/api/v1/runs?game=${GAME_ID}&category=${ANY_PERCENT_CATEGORY_ID}&status=verified&orderby=verify-date&direction=asc`
    + `&var=${VAR_PLATFORM}~${VAL_PC}`
    + `&var=${VAR_NG}~${VAL_NG}`
    + `&var=${VAR_DIFFICULTY}~${VAL_STORY}`
    + `&embed=players,category`;

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