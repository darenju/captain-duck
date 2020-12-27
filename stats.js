const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxNzcxZDA3MC02MGQwLTAxMzgtMmI2MS0zOWFmMzcyZTk3NzMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTg2OTA0NTU1LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImRhcmVuanUtbGl2ZS1jIn0.uCJXiJd-KpA45AR9PJl0NTfytVmX0FVAkIAuJTAdYeA';
const axios = require('axios');
const platform = 'steam';
const url = `https://api.pubg.com/shards/steam/players`;

const modes = {
  fpp: ['solo-fpp', 'duo-fpp', 'squad-fpp'],
  tpp: ['solo', 'duo', 'squad'],
};

function reduce(perspective, key, stats) {
  return modes[perspective].reduce(function (count, mode) {
    return count + stats[mode][key];
  }, 0);
}

axios.defaults.headers.common = {
  'Authorization': `Bearer ${API_KEY}`,
  'Accept': 'application/vnd.api+json',
};

async function getPlayerId(nickname) {
  return axios.get(`${url}?filter[playerNames]=${nickname}`)
    .then(function(response) {
      const { data: { data } } = response;

      if (!data.length) {
        return null;
      }

      return data[0].id;
    })
    .catch(function(_) {
      return null;
    });
}

async function getStats(playerId) {
  return axios.get(`${url}/${playerId}/seasons/lifetime`)
    .then(function (response) {
      const {
        data: {
          data: {
            attributes: {
              gameModeStats,
            },
          },
        },
      } = response;

      const stats = {};

      ['fpp', 'tpp'].forEach(function (mode) {
        stats[mode] = {};

        ['kills', 'headshotKills', 'wins', 'losses'].forEach(function (stat) {
          stats[mode][stat] = reduce(mode, stat, gameModeStats);
        });

        stats[mode].longestKill = Math.round(modes[mode].reduce(function (val, mode) {
          const curr = gameModeStats[mode].longestKill;
          return curr > val ? curr : val;
        }, 0));

        stats[mode].ratio = (stats[mode].kills / stats[mode].losses).toFixed(2);
      });

      return stats;
    })
    .catch(function (error) {
      console.log(error);

      const { response: { status } } = error;

      if (status === 429) {
        console.log('Trop de requêtes, veuillez réessayer plus tard.');
      }
    });
}

module.exports = {
  getPlayerId,
  getStats,
};
