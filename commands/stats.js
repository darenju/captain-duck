const axios = require('axios');
const database = require('../database');

const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxNzcxZDA3MC02MGQwLTAxMzgtMmI2MS0zOWFmMzcyZTk3NzMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTg2OTA0NTU1LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImRhcmVuanUtbGl2ZS1jIn0.uCJXiJd-KpA45AR9PJl0NTfytVmX0FVAkIAuJTAdYeA';
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

const statsFields = {
  ':gun: Frags': 'kills',
  ':skull: Headshots': 'headshotKills',
  ':trophy: Victoires': 'wins',
  ':headstone: Défaites': 'losses',
  ':information_source: Ratio K/D': 'ratio',
  ':crossed_swords: Plus long frag': 'longestKill',
};

function displayStats(allStats, mode, author, message) {
  const stats = allStats[mode];

  const fields = [];

  Object.keys(statsFields).forEach(function (name) {
    fields.push({
      name,
      value: stats[statsFields[name]],
      inline: true,
    });
  });

  const embed = {
    title: `Statistiques PUBG de ${author.username} (${mode.toUpperCase()})`,
    description: `Voici vos statistiques (${mode.toUpperCase()}) depuis vos débuts sur le jeu.`,
    color: '#27ae60',
    fields,
  };

  message.reply({ embed });
}

function setup(client) {
  client.on('message', function(message) {
    const { author, content } = message;

    if (content.startsWith('!link ')) {
      const nickname = content.replace('!link ', '').trim();

      getPlayerId(nickname)
        .then(function (playerId) {
          if (playerId) {
            const players = database.read();
            players[author.id] = playerId;
            database.write(players);
            message.reply(':white_check_mark: Ton nom de joueur a bien été associé !');
          } else {
            message.reply(':warning: Oups… Impossible de trouver ce joueur… Erreur de frappe ?');
          }
        });
    } else if (content.startsWith('!stats')) {
      const players = database.read();
      const playerId = players[author.id];

      if (!playerId) {
        message.reply(':warning: Impossible de te trouver dans la base de données… As-tu bien associé ton nom de joueur avec `!link [nomjoueur]` ?');
      } else {
        getStats(playerId)
          .then(function (stats) {
            const perspectives = [];

            if (content === '!stats') {
              perspectives.push('fpp', 'tpp');
            } else {
              perspectives.push(content === '!statsfpp' ? 'fpp' : 'tpp');
            }

            perspectives.forEach(function (perspective) {
              displayStats(stats, perspective, author, message);
            });
          });
      }
    }
  });
}

module.exports = {
  setup,
};